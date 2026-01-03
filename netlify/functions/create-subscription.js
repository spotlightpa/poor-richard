import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { priceId, email, paymentMethodId } = JSON.parse(event.body);

    if (!email && !paymentMethodId) {
      console.log("Creating setup intent for price:", priceId);
      
      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ["card"],
        metadata: { priceId },
      });

      console.log("Created setup intent:", setupIntent.id);

      return {
        statusCode: 200,
        body: JSON.stringify({
          clientSecret: setupIntent.client_secret,
        }),
      };
    }

    if (email && paymentMethodId) {
      console.log("Creating subscription for email:", email);

      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      let customer;
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log("Found existing customer:", customer.id);
      } else {
        customer = await stripe.customers.create({
          email: email,
        });
        console.log("Created new customer:", customer.id);
      }

      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      console.log("Attached payment method:", paymentMethodId);

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        expand: ["latest_invoice.payment_intent"],
        metadata: {
          newsletter: "Access Harrisburg",
        },
      });

      console.log("Created subscription:", subscription.id);
      console.log("Subscription status:", subscription.status);

      return {
        statusCode: 200,
        body: JSON.stringify({
          subscriptionId: subscription.id,
          status: subscription.status,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        }),
      };
    }

    throw new Error("Invalid request parameters");
  } catch (error) {
    console.error("Subscription creation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
