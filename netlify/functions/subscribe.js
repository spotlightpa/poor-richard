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
    const {
      email,
      phone,
      method,
      facilityId,
      facilityName,
      facilityIds,
      city,
      skipSms,
      summarySms,
      newCount,
      newFacilityName,
      skipEmail,
    } = JSON.parse(event.body);

    if (summarySms) {
      const facilityLabel =
        newCount === 1 && newFacilityName
          ? newFacilityName
          : `${newCount} facilities`;
      if (email) {
        try {
          const token = generateToken(email);
          const manageAllUrl = `${process.env.URL || "https://www.spotlightpa.org"}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}`;
          await ses.send(
            new SendEmailCommand({
              Source: process.env.INSPECTIONS_FROM_EMAIL,
              Destination: { ToAddresses: [email] },
              Message: {
                Subject: {
                  Data: `You're now subscribed to inspection alerts in ${city}`,
                },
                Body: {
                  Text: {
                    Data: `Hi from Spotlight PA,\n\nYou're now subscribed to inspection alerts for ${facilityLabel} in ${city}. Whenever a new inspection report is filed, we'll send you an email.\n\nManage your subscriptions: ${manageAllUrl}\n\n---\nSpotlight PA · PO Box 11728 · Harrisburg, PA 17108`,
                  },
                  Html: {
                    Data: `
                <div style="background-color:#f3f4f6;padding:42px 16px;font-family:Georgia,serif;">
                  <div style="max-width:600px;margin:0 auto;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-bottom:none;border-radius:6px 6px 0 0;">
                      <tr>
                        <td style="padding:16px 32px;">
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
                        </td>
                      </tr>
                    </table>
                    <div style="background-color:#ffffff;padding:36px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#2E2E2E;line-height:1.2;">Restaurant Safety Tracker</h1>
                      <p style="margin:0 0 28px;font-family:sans-serif;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;">${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">Hi from Spotlight PA,</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">You're now subscribed to inspection alerts for <strong>${facilityLabel}</strong> in <strong>${city}</strong>. Whenever a new inspection report is filed, we'll send you an email.</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">We hope this information helps. If you'd like to change what data and facilities you're monitoring, you can <a href="${manageAllUrl}" style="color:#009EDB;text-decoration:underline;">manage your alert settings here anytime</a>.</p>
                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
                      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">If you're finding the Restaurant Safety Tracker useful, please consider <a href="https://www.spotlightpa.org/donate" style="color:#009EDB;text-decoration:underline;">donating to Spotlight PA</a> so we can continue making this data free and accessible.</p>
                      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">Did you know Spotlight PA is an independent, nonpartisan, and nonprofit newsroom dedicated to high-quality investigative and public-service journalism about the Pennsylvania state government and urgent statewide issues? If you want more from our newsroom, <a href="https://www.spotlightpa.org/newsletters" style="color:#009EDB;text-decoration:underline;">check out our newsletters</a>.</p>
                    </div>
                    <div style="background-color:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 6px 6px;">
                      <p style="margin:0 0 8px;font-family:sans-serif;font-size:13px;font-weight:700;color:#111;">Spotlight PA</p>
                      <p style="margin:0 0 16px;font-family:sans-serif;font-size:13px;color:#6b7280;line-height:1.6;">
                        PO Box 11728<br />Harrisburg, PA 17108<br />United States
                      </p>
                      <p style="margin:0;font-family:sans-serif;font-size:13px;color:#6b7280;line-height:1.6;">
                        You're receiving this because you requested alerts from Spotlight PA's Restaurant Safety Tracker.
                        <a href="${manageAllUrl}" style="color:#009EDB;text-decoration:underline;">Manage all your subscriptions</a>
                      </p>
                    </div>
                  </div>
                </div>`,
                  },
                },
              },
            }),
          );
        } catch (emailErr) {
          console.error("Summary email error:", emailErr);
        }
      }
      if (!phone)
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      const digits = phone.replace(/\D/g, "");
      const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
      const { SNSClient, PublishCommand } = await import("@aws-sdk/client-sns");
      const sns = new SNSClient({
        region: process.env.INSPECTIONS_AWS_REGION,
        credentials: {
          accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
        },
      });
      await sns.send(
        new PublishCommand({
          PhoneNumber: e164,
          Message: `Spotlight PA: You're now subscribed to inspection alerts for ${newCount === 1 && newFacilityName ? newFacilityName : `${newCount} facilities`} in ${city}. Reply STOP to unsubscribe.`,
          MessageAttributes: {
            "AWS.SNS.SMS.SMSType": {
              DataType: "String",
              StringValue: "Transactional",
            },
          },
        }),
      );
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    if ((!email && !phone) || (!facilityId && !facilityIds)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Please provide an email or phone number.",
        }),
      };
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "Please enter a valid email address.",
          }),
        };
      }
    }

    const subscriberId = `SUB#${email || `PHONE#${phone.replace(/\D/g, "")}`}`;

    const existing = await db.send(
      new GetCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Key: {
          pk: `FACILITY#${facilityId}`,
          sk: subscriberId,
        },
      }),
    );

    if (existing.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify({ alreadySubscribed: true }),
      };
    }

    await db.send(
      new PutCommand({
        TableName: process.env.SUBSCRIPTIONS_TABLE,
        Item: {
          pk: `FACILITY#${facilityId}`,
          sk: subscriberId,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          method: method || "email",
          facilityId,
          facilityName,
          createdAt: new Date().toISOString(),
          active: true,
        },
      }),
    );

    const baseUrl = process.env.URL || "https://www.spotlightpa.org";

    if (email && !skipEmail) {
      const token = generateToken(email);
      const unsubOneFacilityUrl = `${baseUrl}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}&facilityId=${encodeURIComponent(facilityId)}`;
      const manageAllUrl = `${baseUrl}/.netlify/functions/unsubscribe?token=${encodeURIComponent(token)}`;
      await ses.send(
        new SendEmailCommand({
          Source: process.env.INSPECTIONS_FROM_EMAIL,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: {
              Data: `You're now subscribed to alerts for ${facilityName}`,
            },
            Body: {
              Text: {
                Data: `Hi from Spotlight PA,\n\nYou're now subscribed to inspection alerts for ${facilityName}. Whenever a new inspection report is filed, we'll send you an email.\n\nWe hope this information helps. If you'd like to change what data and facilities you're monitoring, you can manage your alert settings anytime:\n${manageAllUrl}\n\nIf you're finding the Restaurant Safety Tracker useful, please consider donating to Spotlight PA so we can continue making this data free and accessible:\nhttps://www.spotlightpa.org/donate\n\nDid you know Spotlight PA is an independent, nonpartisan, and nonprofit newsroom dedicated to high-quality investigative and public-service journalism about the Pennsylvania state government and urgent statewide issues? If you want more from our newsroom, check out our newsletters:\nhttps://www.spotlightpa.org/newsletters\n\n---\nSpotlight PA\nPO Box 11728\nHarrisburg, PA 17108\nUnited States\n\nYou're receiving this because you requested alerts from Spotlight PA's Restaurant Safety Tracker.\nUnsubscribe from ${facilityName}: ${unsubOneFacilityUrl}\nManage all your subscriptions: ${manageAllUrl}`,
              },
              Html: {
                Data: `
                <div style="background-color:#f3f4f6;padding:42px 16px;font-family:Georgia,serif;">
                  <div style="max-width:600px;margin:0 auto;">

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-bottom:none;border-radius:6px 6px 0 0;">
                      <tr>
                        <td style="padding:16px 32px;">
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
                        </td>
                      </tr>
                    </table>

                    <div style="background-color:#ffffff;padding:36px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                      <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:32px;font-weight:700;color:#2E2E2E;line-height:1.2;">Restaurant Safety Tracker</h1>
                      <p style="margin:0 0 28px;font-family:sans-serif;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;">${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">Hi from Spotlight PA,</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">You're now subscribed to inspection alerts for <strong>${facilityName}</strong>. Whenever a new inspection report is filed, we'll send you an email.</p>
                      <p style="margin:0 0 20px;font-size:18px;line-height:1.6;color:#111;">We hope this information helps. If you'd like to change what data and facilities you're monitoring, you can <a href="${manageAllUrl}" style="color:#009EDB;text-decoration:underline;">manage your alert settings here anytime</a>.</p>

                      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />

                      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">If you're finding the Restaurant Safety Tracker useful, please consider <a href="https://www.spotlightpa.org/donate" style="color:#009EDB;text-decoration:underline;">donating to Spotlight PA</a> so we can continue making this data free and accessible.</p>
                      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#374151;">Did you know Spotlight PA is an independent, nonpartisan, and nonprofit newsroom dedicated to high-quality investigative and public-service journalism about the Pennsylvania state government and urgent statewide issues? If you want more from our newsroom, <a href="https://www.spotlightpa.org/newsletters" style="color:#009EDB;text-decoration:underline;">check out our newsletters</a>.</p>
                    </div>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:none;" >
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
    }

    if (phone && !skipSms) {
      const digits = phone.replace(/\D/g, "");
      const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;
      try {
        const { SNSClient, PublishCommand } =
          await import("@aws-sdk/client-sns");
        const sns = new SNSClient({
          region: process.env.INSPECTIONS_AWS_REGION,
          credentials: {
            accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
          },
        });
        await sns.send(
          new PublishCommand({
            PhoneNumber: e164,
            Message: `Spotlight PA: You're now subscribed to inspection alerts for ${facilityName}. Reply STOP to unsubscribe.`,
            MessageAttributes: {
              "AWS.SNS.SMS.SMSType": {
                DataType: "String",
                StringValue: "Transactional",
              },
            },
          }),
        );
      } catch (smsErr) {
        console.error("SMS send error:", smsErr);
      }
    }

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
