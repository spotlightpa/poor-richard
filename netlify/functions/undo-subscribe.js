import { createHmac, timingSafeEqual } from "crypto";
import { getContactIdByEmail, removeFromList } from "./ac-helpers.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.INSPECTIONS_AWS_REGION,
  credentials: {
    accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
  },
});

const db = DynamoDBDocumentClient.from(client);

function verifyUndoToken(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = createHmac("sha256", process.env.UNSUBSCRIBE_SECRET)
    .update(`undo.${encoded}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { f, s, x } = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    if (!f || !s || !x || Date.now() > x) return null;
    return { facilityId: f, subscriberId: s };
  } catch {
    return null;
  }
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const verified = verifyUndoToken(body.undoToken);
  if (!verified) {
    return json(400, {
      error:
        "This alert can no longer be removed here. Use the link in your confirmation email or text.",
    });
  }

  const { facilityId, subscriberId } = verified;

  try {
    await db.send(
      new DeleteCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Key: { pk: `FACILITY#${facilityId}`, sk: subscriberId },
      }),
    );

    const email = subscriberId.startsWith("SUB#PHONE#")
      ? ""
      : subscriberId.slice("SUB#".length);
    if (email) {
      try {
        const remaining = await db.send(
          new QueryCommand({
            TableName: process.env.SUBSCRIPTIONS_TABLE,
            IndexName: "email-index",
            KeyConditionExpression: "email = :val",
            ExpressionAttributeValues: { ":val": email },
          }),
        );
        if ((remaining.Items || []).length === 0) {
          const contactId = await getContactIdByEmail(email);
          if (contactId) await removeFromList(contactId);
        }
      } catch {
        return json(200, { success: true });
      }
    }

    return json(200, { success: true });
  } catch {
    return json(500, { error: "Something went wrong. Please try again." });
  }
};
