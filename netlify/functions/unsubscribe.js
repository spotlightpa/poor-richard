import { createHmac } from "crypto";
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

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expected = createHmac("sha256", process.env.UNSUBSCRIBE_SECRET)
    .update(encoded)
    .digest("base64url");
  if (sig !== expected) return null;
  try {
    return Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function escapeHTML(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function successPage(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — Spotlight PA</title>
  <style>
    body { font-family: Georgia, serif; background: #f9fafb; margin: 0; padding: 40px 16px; color: #111; }
    .card { background: white; max-width: 520px; margin: 0 auto; border-radius: 8px; padding: 48px 40px 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.10); border-top: 4px solid #009EDB; }
    h1 { font-size: 24px; margin: 0 0 12px; }
    p { font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 16px; }
    a { color: #009EDB; }
    .check { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="check">✓</div>
    <h1>${escapeHTML(message)}</h1>
    <p>Your subscription preferences have been updated.</p>
    <p>
      <a href="https://www.spotlightpa.org/restaurant-inspections" style="display:inline-block;background-color:#009EDB;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-decoration:none;padding:12px 24px;border-radius:6px;">← Back to Restaurant Safety Tracker</a>
    </p>
    <p style="font-size:13px;color:#9ca3af;">
      Questions? Contact <a href="mailto:info@spotlightpa.org">info@spotlightpa.org</a>
    </p>
  </div>
</body>
</html>`;
}

function managePage(token, subs) {
  const baseUrl = process.env.URL || "https://www.spotlightpa.org";
  const action = `${baseUrl}/.netlify/functions/unsubscribe`;

  const rows = subs.length
    ? [...subs]
        .sort((a, b) => {
          const nameA = (a.facilityName || a.facilityId).split(" — ")[0].trim();
          const nameB = (b.facilityName || b.facilityId).split(" — ")[0].trim();
          const startsWithNum = (s) => /^[0-9]/.test(s);
          if (startsWithNum(nameA) && !startsWithNum(nameB)) return 1;
          if (!startsWithNum(nameA) && startsWithNum(nameB)) return -1;
          return nameA.localeCompare(nameB);
        })
        .map(
          (sub) => `
      <label style="display:flex;align-items:flex-start;gap:14px;padding:16px 0;border-bottom:1px solid #e5e7eb;cursor:pointer;">
        <input type="checkbox" name="facilityIds" value="${escapeHTML(sub.facilityId)}" checked
          style="width:16px;height:16px;flex-shrink:0;cursor:pointer;" />
        <span style="font-size:15px;color:#111;line-height:1.4;">${escapeHTML((sub.facilityName || sub.facilityId).split(" — ")[0])}<br/><span style="font-size:13px;color:#6b7280;">${escapeHTML((sub.facilityName || sub.facilityId).split(" — ")[1] || "")}</span></span>
      </label>`,
        )
        .join("")
    : `<p style="color:#6b7280;font-size:15px;">You have no active subscriptions.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Manage Alerts — Spotlight PA</title>
  <style>
    body { font-family: Georgia, serif; background: #f9fafb; margin: 0; padding: 40px 16px; color: #111; }
    .card { background: white; max-width: 520px; margin: 0 auto; border-radius: 8px; padding: 40px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    h1 { font-size: 28px; margin: 0 0 8px; font-family: Georgia, serif; }
    .sub { font-size: 15px; color: #6b7280; margin: 0 0 28px; line-height: 1.5; }
    .facility-list { margin: 0 0 24px; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    button[type="submit"] {
      background: #cc0000; background-image: linear-gradient(to right,#e11d48,#cc0000);
      color: white; border: none; border-radius: 6px;
      padding: 12px 28px; font-size: 15px; font-family: inherit; cursor: pointer;
      font-weight: 700; letter-spacing: 0.03em;
    }
    button[type="submit"]:hover { background: #b91c1c; background-image: none; }
    .select-links { font-size: 13px; margin-bottom: 16px; }
    .select-links a { color: #009EDB; cursor: pointer; text-decoration: underline; margin-right: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <a href="https://www.spotlightpa.org/restaurant-inspections" style="display:inline-flex;align-items:center;gap:6px;color:#6b7280;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-decoration:none;margin:0 0 28px;letter-spacing:0.05em;text-transform:uppercase;">← Back to Restaurant Safety Tracker</a>
    <h1>Manage your alerts</h1>
    <p class="sub">Uncheck any facilities you no longer want to receive alerts for, then click Save.</p>

    <div style="display:flex;align-items:center;justify-content:space-between;margin:0 0 4px;padding-bottom:12px;border-bottom:2px solid #111;">
      <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#111;">${subs.length} ${subs.length === 1 ? "Facility" : "Facilities"}</span>
      ${subs.length ? `<span style="font-family:Arial,sans-serif;font-size:12px;"><a onclick="document.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=true)" style="color:#009EDB;cursor:pointer;text-decoration:underline;">Select all</a> &nbsp;·&nbsp; <a onclick="document.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=false)" style="color:#009EDB;cursor:pointer;text-decoration:underline;">Deselect all</a></span>` : ""}
    </div>
    <form method="POST" action="${escapeHTML(action)}">
      <input type="hidden" name="token" value="${escapeHTML(token)}" />
      <div class="facility-list">${rows}</div>
      ${
        subs.length
          ? `<div class="actions">
          <button type="submit">Save</button>
        </div>`
          : ""
      }
    </form>

  </div>
</body>
</html>`;
}

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  const facilityId = params.facilityId || "";

  const bodyParams =
    event.httpMethod === "POST" ? new URLSearchParams(event.body || "") : null;
  const token = bodyParams?.get("token") || params.token || "";

  const email = verifyToken(token);
  if (!email) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html" },
      body: `<p style="font-family:sans-serif;padding:40px;">This unsubscribe link is invalid or has expired. Please use the link from your original confirmation email.</p>`,
    };
  }

  if (event.httpMethod === "GET" && facilityId) {
    try {
      await Promise.allSettled([
        db.send(
          new DeleteCommand({
            TableName: process.env.SUBSCRIPTIONS_TABLE,
            Key: { pk: `FACILITY#${facilityId}`, sk: `EMAIL#${email}` },
          }),
        ),
        db.send(
          new DeleteCommand({
            TableName: process.env.SUBSCRIPTIONS_TABLE,
            Key: { pk: `FACILITY#${facilityId}`, sk: `SUB#${email}` },
          }),
        ),
      ]);
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: successPage("You've been unsubscribed."),
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Unsubscribe error:", err);
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/html" },
        body: `<p style="font-family:sans-serif;padding:40px;">Something went wrong. Please try again or contact info@spotlightpa.org.</p>`,
      };
    }
  }

  if (event.httpMethod === "GET") {
    try {
      const result = await db.send(
        new QueryCommand({
          TableName: process.env.SUBSCRIPTIONS_TABLE,
          IndexName: "email-index",
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: { ":email": email },
        }),
      );
      const subs = result.Items || [];
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: managePage(token, subs),
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Manage page error:", err);
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/html" },
        body: `<p style="font-family:sans-serif;padding:40px;">Something went wrong loading your subscriptions. Please try again.</p>`,
      };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = new URLSearchParams(event.body || "");
      const selectedIds = body.getAll("facilityIds");

      const result = await db.send(
        new QueryCommand({
          TableName: process.env.SUBSCRIPTIONS_TABLE,
          IndexName: "email-index",
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: { ":email": email },
        }),
      );
      const allSubs = result.Items || [];

      const toDelete = allSubs.filter(
        (sub) => !selectedIds.includes(sub.facilityId),
      );

      await Promise.all(
        toDelete.flatMap((sub) => [
          db.send(
            new DeleteCommand({
              TableName: process.env.SUBSCRIPTIONS_TABLE,
              Key: { pk: `FACILITY#${sub.facilityId}`, sk: `EMAIL#${email}` },
            }),
          ),
          db.send(
            new DeleteCommand({
              TableName: process.env.SUBSCRIPTIONS_TABLE,
              Key: { pk: `FACILITY#${sub.facilityId}`, sk: `SUB#${email}` },
            }),
          ),
        ]),
      );

      const removedCount = toDelete.length;
      const message =
        removedCount > 0
          ? `Done — ${removedCount} subscription${removedCount !== 1 ? "s" : ""} removed.`
          : "Your preferences are saved.";

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: successPage(message),
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Save preferences error:", err);
      return {
        statusCode: 500,
        headers: { "Content-Type": "text/html" },
        body: `<p style="font-family:sans-serif;padding:40px;">Something went wrong saving your preferences. Please try again.</p>`,
      };
    }
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
