const AC_BASE = "https://spotlightpa.api-us1.com/api/3";
const AC_LIST_ID = 26;

export async function acFetch(path, method = "GET", body = null) {
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

export async function upsertContact(email, phone) {
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

export async function addToList(contactId) {
  await acFetch("/contactLists", "POST", {
    contactList: {
      list: AC_LIST_ID,
      contact: contactId,
      status: 1,
    },
  });
}

export async function removeFromList(contactId) {
  await acFetch("/contactLists", "POST", {
    contactList: {
      list: AC_LIST_ID,
      contact: contactId,
      status: 2,
    },
  });
}

export async function getContactIdByEmail(email) {
  const lookup = await acFetch(`/contacts?email=${encodeURIComponent(email)}`);
  return lookup.contacts?.[0]?.id || null;
}
