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
                <div style="background-color:#f3f4f6;padding:42px 16px;font-family:Georgia,serif;">
                  <div style="max-width:600px;margin:0 auto;">

                    <div style="background-color:#111;padding:16px 32px;border-radius:6px 6px 0 0;">
                      <p style="margin:0;font-family:sans-serif;font-size:18px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#fff;">Spotlight PA · Restaurant Safety Tracker</p>
                    </div>

                    <div style="background-color:#ffffff;padding:36px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">Hi,</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">You're now subscribed to inspection alerts for <strong>${facilityName}</strong>. Whenever a new inspection report is filed, we'll send you an email.</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">We hope this information helps. If you'd like to change what data and facilities you're monitoring, you can <a href="${manageAllUrl}" style="color:#009EDB;text-decoration:underline;">manage your alert settings here anytime</a>.</p>

                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />

                      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">If you're finding the Restaurant Safety Tracker useful, please consider <a href="https://www.spotlightpa.org/donate" style="color:#009EDB;text-decoration:underline;">donating to Spotlight PA</a> so we can continue making this data free and accessible.</p>
                      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">Did you know Spotlight PA is an independent, nonpartisan, and nonprofit newsroom dedicated to high-quality investigative and public-service journalism about the Pennsylvania state government and urgent statewide issues? If you want more from our newsroom, <a href="https://www.spotlightpa.org/newsletters" style="color:#009EDB;text-decoration:underline;">check out our newsletters</a>.</p>
                    </div>

                <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background-color:#ffffff;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;"
                >
                <tr>
                    <td style="padding:16px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                        <td valign="middle">
                        <a href="https://www.spotlightpa.org/" style="text-decoration:none;border:0;">
                        <img
                            src="https://content.app-us1.com/cdn-cgi/image/format=auto,onerror=redirect,width=400,dpr=2,fit=scale-down/Jlmyy/2024/09/04/06621245-c7e2-43ac-9b0f-36587bd44d0a.png"
                            alt="Spotlight PA"
                            width="300"
                            border="0"
                            style="height:auto;display:block;max-width:100%;border:0;"
                        />
                        </a>
                        </td>
                        <td valign="middle" align="right" style="padding-left:24px;white-space:nowrap;">
                <a
                href="https://www.spotlightpa.org/donate"
                style="
                    display:inline-block;
                    background-color:#cc0000;
                    background-image:linear-gradient(to right,#e11d48,#cc0000);
                    color:#ffffff;
                    font-family:Arial,sans-serif;
                    font-size:12px;
                    font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:0.06em;
                    text-decoration:none;
                    padding:10px 18px;
                    border-radius:6px;
                    white-space:nowrap;
                "
                >
                Donate
                </a>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                </table>

                    <div style="background-color:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;">
                      <p style="margin:0 0 8px;font-family:sans-serif;font-size:13px;font-weight:700;color:#111;">Spotlight PA</p>
                      <p style="margin:0 0 16px;font-family:sans-serif;font-size:13px;color:#6b7280;line-height:1.6;">
                        PO Box 11728<br />
                        Harrisburg, PA 17108<br />
                        United States
                      </p>
                      <p style="margin:0;font-family:sans-serif;font-size:13px;color:#6b7280;line-height:1.6;">
                        You're receiving this because you requested alerts from Spotlight PA's Restaurant Safety Tracker.
                        <a href="${unsubOneFacilityUrl}" style="color:#009EDB;text-decoration:underline;">Unsubscribe from ${facilityName}</a> &middot;
                        <a href="${manageAllUrl}" style="color:#009EDB;text-decoration:underline;">Manage all your subscriptions</a>
                      </p>
                    </div>

                  </div>
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
