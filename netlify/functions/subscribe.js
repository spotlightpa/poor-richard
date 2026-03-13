import { createHmac } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new DynamoDBClient({
  region: process.env.INSPECTIONS_AWS_REGION,
  credentials: {
    accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
  },
});

const ses = new SESClient({
  region: process.env.INSPECTIONS_AWS_REGION,
  credentials: {
    accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
  },
});

const db = DynamoDBDocumentClient.from(client);

function generateToken(email) {
  const encoded = Buffer.from(email).toString("base64url");
  const sig = createHmac("sha256", process.env.UNSUBSCRIBE_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, phone, method, facilityId, facilityName } = JSON.parse(
      event.body,
    );

    if (!email || !facilityId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and facility are required." }),
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please enter a valid email address." }),
      };
    }

    const existing = await db.send(
      new GetCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Key: {
          pk: `FACILITY#${facilityId}`,
          sk: `EMAIL#${email}`,
        },
      }),
    );

    if (existing.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: "You're already subscribed to alerts for this facility.",
        }),
      };
    }

    await db.send(
      new PutCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Item: {
          pk: `FACILITY#${facilityId}`,
          sk: `EMAIL#${email}`,
          email,
          phone: phone || null,
          method: method || "email",
          facilityId,
          facilityName,
          createdAt: new Date().toISOString(),
          active: true,
        },
      }),
    );

    const token = generateToken(email);
    const baseUrl = process.env.URL || "https://www.spotlightpa.org";
    const unsubOneFacilityUrl = `${baseUrl}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}&facilityId=${encodeURIComponent(facilityId)}`;
    const manageAllUrl = `${baseUrl}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}`;

    await ses.send(
      new SendEmailCommand({
        Source: process.env.INSPECTIONS_FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: {
            Data: `You're subscribed to alerts for ${facilityName}`,
          },
          Body: {
            Text: {
              Data: `Hi,\n\nYou're now subscribed to inspection alerts for ${facilityName}. Whenever a new inspection report is filed, we'll send you an email.\n\nWe hope this information helps. If you'd like to change what data and facilities you're monitoring, you can manage your alert settings anytime:\n${manageAllUrl}\n\nIf you're finding the Restaurant Safety Tracker useful, please consider donating to Spotlight PA so we can continue making this data free and accessible:\nhttps://www.spotlightpa.org/donate\n\nDid you know Spotlight PA is an independent, nonpartisan, and nonprofit newsroom dedicated to high-quality investigative and public-service journalism about the Pennsylvania state government and urgent statewide issues? If you want more from our newsroom, check out our newsletters:\nhttps://www.spotlightpa.org/newsletters\n\n---\nSpotlight PA\nPO Box 11728\nHarrisburg, PA 17108\nUnited States\n\nYou're receiving this because you requested alerts from Spotlight PA's Restaurant Safety Tracker.\nUnsubscribe from ${facilityName}: ${unsubOneFacilityUrl}\nManage all your subscriptions: ${manageAllUrl}`,
            },
            Html: {
              Data: `
                <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#111;">
                  <p>Hi,</p>
                  <p>You're now subscribed to inspection alerts for <strong>${facilityName}</strong>. Whenever a new inspection report is filed, we'll send you an email.</p>
                  <p>We hope this information helps. If you'd like to change what data and facilities you're monitoring, you can <a href="${manageAllUrl}" style="color:#009EDB;">manage your alert settings here anytime</a>.</p>
                  <p>If you're finding the Restaurant Safety Tracker useful, please consider <a href="https://www.spotlightpa.org/donate" style="color:#009EDB;">donating to Spotlight PA</a> so we can continue making this data free and accessible. Did you know Spotlight PA is an independent, nonpartisan, and nonprofit newsroom dedicated to high-quality investigative and public-service journalism about the Pennsylvania state government and urgent statewide issues? If you want more from our newsroom, <a href="https://www.spotlightpa.org/newsletters" style="color:#009EDB;">check out our newsletters</a>.</p>
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
                  <div style="text-align:center;margin:24px 0;">
                    <img
                      src="https://images.data.spotlightpa.org/insecure/rt:fill/w:600/g:sm/el:1/q:75/MjAyNi8wMy8wMW12LThrbjMtNnE3MC1zYW01LnBuZw%3D%3D.jpg"
                      alt="Spotlight PA"
                      width="600"
                      style="max-width:100%;height:auto;display:block;margin:0 auto;"
                    />
                  </div>
                  <p style="font-size:12px;color:#6b7280;">
                    Spotlight PA<br />
                    PO Box 11728<br />
                    Harrisburg, PA 17108<br />
                    United States
                  </p>
                  <p style="font-size:12px;color:#6b7280;">
                    You're receiving this because you requested alerts from Spotlight PA's Restaurant Safety Tracker.
                    <a href="${unsubOneFacilityUrl}" style="color:#009EDB;">Unsubscribe from ${facilityName}</a> &middot;
                    <a href="${manageAllUrl}" style="color:#009EDB;">Manage all your subscriptions</a>
                  </p>
                </div>
              `,
            },
          },
        },
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Subscribe error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Something went wrong. Please try again.",
      }),
    };
  }
};
