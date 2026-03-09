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
              Data: `Hi,\n\nYou're now subscribed to inspection alerts for ${facilityName}.\n\nWhenever a new inspection report is filed, we'll send you an email.\n\nSpotlight PA Restaurant Safety Tracker\nhttps://www.spotlightpa.org/restaurants`,
            },
            Html: {
              Data: `
                <p>Hi,</p>
                <p>You're now subscribed to inspection alerts for <strong>${facilityName}</strong>.</p>
                <p>Whenever a new inspection report is filed, we'll send you an email.</p>
                <p><a href="https://www.spotlightpa.org/restaurants">Spotlight PA Restaurant Safety Tracker</a></p>
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
