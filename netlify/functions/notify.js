import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { createHmac } from "crypto";

const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.INSPECTIONS_AWS_REGION,
    credentials: {
      accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
    },
  }),
);

const ses = new SESClient({
  region: process.env.INSPECTIONS_AWS_REGION,
  credentials: {
    accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
  },
});

const sns = new SNSClient({
  region: process.env.INSPECTIONS_AWS_REGION,
  credentials: {
    accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
  },
});

function generateToken(email) {
  const encoded = Buffer.from(email).toString("base64url");
  const sig = createHmac("sha256", process.env.UNSUBSCRIBE_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

function buildEmailHtml({
  facilityName,
  facilityId,
  inspectionDate,
  violations,
  unsubUrl,
  manageUrl,
}) {
  const dateStr = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  const trackerUrl = `https://www.spotlightpa.org/restaurant-inspections/#${facilityId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

  const violationCount = violations.length;

  return `
<div style="background-color:#f3f4f6;padding:42px 16px;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-bottom:none;border-radius:6px 6px 0 0;">
      <tr><td style="padding:16px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle">
              <a href="https://www.spotlightpa.org/" style="text-decoration:none;border:0;">
                <img src="https://content.app-us1.com/cdn-cgi/image/format=auto,onerror=redirect,width=400,dpr=2,fit=scale-down/Jlmyy/2024/09/04/06621245-c7e2-43ac-9b0f-36587bd44d0a.png" alt="Spotlight PA" width="200" border="0" style="height:auto;display:block;max-width:100%;border:0;" />
              </a>
            </td>
            <td valign="middle" align="right" style="padding-left:24px;white-space:nowrap;">
              <a href="https://www.spotlightpa.org/donate" style="display:inline-block;background-color:#cc0000;background-image:linear-gradient(to right,#e11d48,#cc0000);color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-decoration:none;padding:10px 18px;border-radius:6px;white-space:nowrap;">Donate</a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
    <div style="background-color:#ffffff;padding:36px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#2E2E2E;line-height:1.2;">Restaurant Safety Tracker</h1>
      <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;">${dateStr}</p>
      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">Hi from Spotlight PA,</p>
      <p style="margin:0 0 28px;font-size:18px;line-height:1.6;color:#111;">A new inspection report has been filed for a facility you're tracking.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:20px 24px;margin:0 0 28px;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#9ca3af;">${inspectionDate}</p>
        <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111;font-family:Georgia,serif;">${facilityName}</p>
        <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;color:#374151;font-style:italic;">${facilityId.split(" — ")[1] || ""}</p>
        
        ${violationCount ? `<span style="display:inline-block;margin-top:4px;background-color:#fef2f2;color:#b91c1c;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:4px 12px;border-radius:9999px;border:1px solid #fecaca;">${violationCount} violation${violationCount !== 1 ? "s" : ""}</span>` : `<span style="display:inline-block;margin-top:4px;background-color:#f0fdf4;color:#15803d;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:4px 12px;border-radius:9999px;border:1px solid #bbf7d0;">No violations</span>`}
      </div>
      <a href="${trackerUrl}" style="display:inline-block;background-color:#111;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;text-decoration:none;padding:14px 28px;border-radius:6px;">${violationCount ? "View the violations →" : "View the tracker →"}</a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">If you're finding the Restaurant Safety Tracker useful, please consider <a href="https://www.spotlightpa.org/donate" style="color:#009EDB;text-decoration:underline;">donating to Spotlight PA</a> so we can continue making this data free and accessible.</p>
    </div>
    <div style="background-color:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#111;">Spotlight PA</p>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;line-height:1.6;">PO Box 11728<br />Harrisburg, PA 17108</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;line-height:1.6;">
        You're receiving this because you subscribed to alerts from Spotlight PA's Restaurant Safety Tracker.
        <a href="${unsubUrl}" style="color:#009EDB;text-decoration:underline;">Unsubscribe from ${facilityName}</a> &middot;
        <a href="${manageUrl}" style="color:#009EDB;text-decoration:underline;">Manage all subscriptions</a>
      </p>
    </div>
  </div>
</div>`;
}

async function notifySubscribers({
  facilityId,
  facilityName,
  inspectionDate,
  violations,
}) {
  const { Items: subscribers = [] } = await db.send(
    new QueryCommand({
      TableName: process.env.SUBSCRIPTIONS_TABLE,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": `FACILITY#${facilityId}` },
    }),
  );

  const baseUrl = process.env.URL || "https://www.spotlightpa.org";

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      if (sub.email) {
        const token = generateToken(sub.email);
        const unsubUrl = `${baseUrl}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}&facilityId=${encodeURIComponent(facilityId)}`;
        const manageUrl = `${baseUrl}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}`;

        await ses.send(
          new SendEmailCommand({
            Source: process.env.INSPECTIONS_FROM_EMAIL,
            Destination: { ToAddresses: [sub.email] },
            Message: {
              Subject: { Data: `New inspection report: ${facilityName}` },
              Body: {
                Text: {
                  Data: `Hi from Spotlight PA,\n\nA new inspection report has been filed for ${facilityName} on ${inspectionDate}.\n\nView the full report: https://www.spotlightpa.org/restaurant-inspections\n\nManage your subscriptions: ${manageUrl}\n\n---\nSpotlight PA · PO Box 11728 · Harrisburg, PA 17108`,
                },
                Html: {
                  Data: buildEmailHtml({
                    facilityName,
                    facilityId,
                    inspectionDate,
                    violations,
                    unsubUrl,
                    manageUrl,
                  }),
                },
              },
            },
          }),
        );
      }

      if (sub.phone) {
        const digits = sub.phone.replace(/\D/g, "");
        const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
        const violationSummary = violations.length
          ? `${violations.length} violation${violations.length !== 1 ? "s" : ""} reported.`
          : "No violations reported.";

        await sns.send(
          new PublishCommand({
            PhoneNumber: e164,
            Message: `Spotlight PA: New inspection for ${facilityName} on ${inspectionDate}. ${violationSummary} View: https://www.spotlightpa.org/restaurant-inspections Reply STOP to unsubscribe.`,
            MessageAttributes: {
              "AWS.SNS.SMS.SMSType": {
                DataType: "String",
                StringValue: "Transactional",
              },
            },
          }),
        );
      }
    }),
  );
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if ((event.headers["x-notify-secret"] || "") !== process.env.NOTIFY_SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  try {
    const { inspections } = JSON.parse(event.body);
    if (!Array.isArray(inspections) || !inspections.length) {
      return { statusCode: 400, body: "No inspections provided" };
    }
    for (const inspection of inspections) {
      await notifySubscribers(inspection);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, count: inspections.length }),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }
};
