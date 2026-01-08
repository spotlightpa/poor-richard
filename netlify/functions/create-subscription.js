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

        const currentPrice = await stripe.prices.retrieve(priceId);

        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: "all",
          limit: 100,
        });

        const blockedStatuses = ["active", "trialing", "past_due", "unpaid"];

        const hasActiveOnSameProduct = subs.data.some((sub) => {
          if (!blockedStatuses.includes(sub.status)) return false;

          return sub.items.data.some(
            (item) => item.price.product === currentPrice.product,
          );
        });

        if (hasActiveOnSameProduct) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              error:
                "You already have an active subscription for this newsletter. To switch plans, please contact membership@spotlightpa.org.",
            }),
          };
        }
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

      if (
        subscription.status === "incomplete" ||
        subscription.status === "past_due"
      ) {
        const paymentIntent = subscription.latest_invoice?.payment_intent;
        const errorMessage =
          paymentIntent?.last_payment_error?.message || "Payment failed";

        console.log("Subscription payment failed:", errorMessage);

        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `${errorMessage}. Please try a different payment method.`,
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          subscriptionId: subscription.id,
          status: subscription.status,
          clientSecret:
            subscription.latest_invoice?.payment_intent?.client_secret,
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
