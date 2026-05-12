import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const db = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.INSPECTIONS_AWS_REGION,
    credentials: {
      accessKeyId: process.env.INSPECTIONS_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.INSPECTIONS_AWS_SECRET_ACCESS_KEY,
    },
  }),
);

const AC_BASE = "https://spotlightpa.api-us1.com/api/3";
const AC_LIST_ID = 26;

async function acFetch(path, method = "GET", body = null) {
  const res = await fetch(`${AC_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Api-Token": process.env.ACTIVECAMPAIGN_API_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

async function getAllDynamoSubscribers() {
  const subscribers = {};
  let lastKey = null;

  do {
    const params = {
      TableName: process.env.SUBSCRIPTIONS_TABLE,
      ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
    };
    const result = await db.send(new ScanCommand(params));
    for (const item of result.Items || []) {
      const email = item.email?.toLowerCase();
      const phone = item.phone || null;
      const created = item.createdAt || "";
      if (!email) continue;
      const key = email;
      if (!subscribers[key]) {
        subscribers[key] = { email, phone, createdAt: created, count: 0 };
      }
      subscribers[key].count++;
    }
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return Object.values(subscribers);
}

async function upsertContact(email, phone) {
  const data = await acFetch("/contacts", "POST", {
    contact: {
      email,
      ...(phone ? { phone } : {}),
    },
  });

  if (data.contact?.id) return data.contact.id;

  if (data.errors?.[0]?.code === "duplicate") {
    const lookup = await acFetch(
      `/contacts?email=${encodeURIComponent(email)}`,
    );
    return lookup.contacts?.[0]?.id || null;
  }

  return null;
}

async function addToList(contactId) {
  await acFetch("/contactLists", "POST", {
    contactList: {
      list: AC_LIST_ID,
      contact: contactId,
      status: 1,
    },
  });
}

async function getACListContacts() {
  const contacts = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const data = await acFetch(
      `/contacts?listid=${AC_LIST_ID}&limit=${limit}&offset=${offset}`,
    );
    const batch = data.contacts || [];
    contacts.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }

  return contacts;
}

async function removeFromList(contactId) {
  await acFetch("/contactLists", "POST", {
    contactList: {
      list: AC_LIST_ID,
      contact: contactId,
      status: 2,
    },
  });
}

export const handler = async () => {
  try {
    const subscribers = await getAllDynamoSubscribers();
    const subscriberEmails = new Set(subscribers.map((s) => s.email));

    for (const sub of subscribers) {
      const contactId = await upsertContact(sub.email, sub.phone);
      if (contactId) await addToList(contactId);
    }

    const acContacts = await getACListContacts();
    for (const contact of acContacts) {
      if (!subscriberEmails.has(contact.email?.toLowerCase())) {
        await removeFromList(contact.id);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`Synced ${subscribers.length} subscribers to AC`);
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("sync-ac error:", err);
    return { statusCode: 500, body: "Error" };
  }
};

export const config = {
  schedule: "0 6 * * *",
};