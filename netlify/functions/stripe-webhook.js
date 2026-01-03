import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  try {
    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = stripeEvent.data.object;

        if (subscription.status === "active") {
          await handleActiveSubscription(subscription);
        }
        break;

      case "invoice.payment_succeeded":
        const invoice = stripeEvent.data.object;
        if (invoice.billing_reason === "subscription_create") {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          await handleActiveSubscription(sub);
        }
        break;

      case "customer.subscription.deleted":
        console.log("Subscription cancelled:", stripeEvent.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (error) {
    console.error("Webhook handler error:", error);
    return { statusCode: 500, body: `Webhook Error: ${error.message}` };
  }
};

async function handleActiveSubscription(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const email = customer.email;

    if (!email) {
      console.error("No email found for customer:", subscription.customer);
      return;
    }

    await addToMailingList(email, subscription);

    console.log(`Successfully added ${email} to mailing list`);
  } catch (error) {
    console.error("Error handling subscription:", error);
    throw error;
  }
}

async function addToMailingList(email, subscription) {
  const ACTIVE_CAMPAIGN_URL = process.env.ACTIVE_CAMPAIGN_URL;
  const ACTIVE_CAMPAIGN_KEY = process.env.ACTIVE_CAMPAIGN_KEY;
  const LIST_ID = process.env.ACTIVE_CAMPAIGN_LIST_ID;

  if (!ACTIVE_CAMPAIGN_URL || !ACTIVE_CAMPAIGN_KEY) {
    console.error("ActiveCampaign credentials not configured");
    return;
  }

  const price = subscription.items.data[0].price;
  const subscriptionType =
    price.recurring.interval === "year" ? "annual" : "monthly";

  try {
    const contactResponse = await fetch(
      `${ACTIVE_CAMPAIGN_URL}/api/3/contact/sync`,
      {
        method: "POST",
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: {
            email: email,
            fieldValues: [
              {
                field: "1",
                value: subscriptionType,
              },
            ],
          },
        }),
      },
    );

    const contactData = await contactResponse.json();
    const contactId = contactData.contact.id;

    if (LIST_ID) {
      await fetch(`${ACTIVE_CAMPAIGN_URL}/api/3/contactLists`, {
        method: "POST",
        headers: {
          "Api-Token": ACTIVE_CAMPAIGN_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactList: {
            list: LIST_ID,
            contact: contactId,
            status: 1,
          },
        }),
      });
    }

    console.log(`Added ${email} to ActiveCampaign list`);
  } catch (error) {
    console.error("ActiveCampaign API error:", error);
    throw error;
  }
}
