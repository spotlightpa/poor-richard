import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
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
