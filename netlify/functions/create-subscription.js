import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { priceId, email, paymentMethodId, firstName, lastName, promoCode } =
      requestBody;

    if (!email && !paymentMethodId) {
      // eslint-disable-next-line no-console
      console.log("Creating setup intent for price:", priceId);

      const setupIntent = await stripe.setupIntents.create({
        payment_method_types: ["card"],
        metadata: { priceId },
      });

      // eslint-disable-next-line no-console
      console.log("Created setup intent:", setupIntent.id);

      return {
        statusCode: 200,
        body: JSON.stringify({
          clientSecret: setupIntent.client_secret,
        }),
      };
    }

    if (email && paymentMethodId) {
      // eslint-disable-next-line no-console
      console.log("Creating subscription for email:", email);

      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      let customer;
      if (customers.data.length > 0) {
        customer = customers.data[0];
        // eslint-disable-next-line no-console
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
          name: `${firstName} ${lastName}`,
        });
        // eslint-disable-next-line no-console
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

      // eslint-disable-next-line no-console
      console.log("Attached payment method:", paymentMethodId);

      let discounts = [];
      if (promoCode) {
        try {
          const promoCodes = await stripe.promotionCodes.list({
            code: promoCode,
            active: true,
            limit: 1,
          });

          if (promoCodes.data.length === 0) {
            return {
              statusCode: 400,
              body: JSON.stringify({
                error:
                  "Invalid promotion code. Please check the code and try again.",
              }),
            };
          }

          const promoCodeObj = promoCodes.data[0];

          if (
            promoCodeObj.expires_at &&
            promoCodeObj.expires_at < Math.floor(Date.now() / 1000)
          ) {
            return {
              statusCode: 400,
              body: JSON.stringify({
                error: "This promotion code has expired.",
              }),
            };
          }

          if (
            promoCodeObj.max_redemptions &&
            promoCodeObj.times_redeemed >= promoCodeObj.max_redemptions
          ) {
            return {
              statusCode: 400,
              body: JSON.stringify({
                error:
                  "This promotion code has reached its maximum number of redemptions.",
              }),
            };
          }

          discounts = [{ promotion_code: promoCodeObj.id }];
          // eslint-disable-next-line no-console
          console.log("Applied promotion code:", promoCodeObj.code);
        } catch (promoError) {
          // eslint-disable-next-line no-console
          console.error("Promotion code error:", promoError);
          return {
            statusCode: 400,
            body: JSON.stringify({
              error: "Error validating promotion code. Please try again.",
            }),
          };
        }
      }

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
        metadata: {
          newsletter: "Access Harrisburg",
        },
        ...(discounts.length > 0 && { discounts }),
      });

      let paymentIntent = subscription.latest_invoice?.payment_intent;

      if (!paymentIntent && subscription.latest_invoice?.id) {
        try {
          const paidInvoice = await stripe.invoices.pay(
            subscription.latest_invoice.id,
            {
              payment_method: paymentMethodId,
              expand: ["payment_intent"],
            },
          );

          paymentIntent = paidInvoice.payment_intent;

          if (paymentIntent) {
            // eslint-disable-next-line no-console
            console.log("PaymentIntent ID:", paymentIntent.id);
            // eslint-disable-next-line no-console
            console.log("PaymentIntent status:", paymentIntent.status);
          }

          if (paidInvoice.status === "paid") {
            return {
              statusCode: 200,
              body: JSON.stringify({
                subscriptionId: subscription.id,
                status: "active",
              }),
            };
          }
        } catch (invoiceError) {
          if (invoiceError.code === "invoice_payment_intent_requires_action") {
            const updatedInvoice = await stripe.invoices.retrieve(
              subscription.latest_invoice.id,
              { expand: ["payment_intent"] },
            );

            paymentIntent = updatedInvoice.payment_intent;
          } else {
            throw invoiceError;
          }
        }
      }

      if (paymentIntent) {
        if (paymentIntent.status === "requires_action") {
          return {
            statusCode: 200,
            body: JSON.stringify({
              subscriptionId: subscription.id,
              status: "incomplete",
              clientSecret: paymentIntent.client_secret,
              paymentIntentStatus: paymentIntent.status,
              requiresAction: true,
            }),
          };
        }

        if (paymentIntent.status === "succeeded") {
          return {
            statusCode: 200,
            body: JSON.stringify({
              subscriptionId: subscription.id,
              status: "active",
            }),
          };
        }

        if (paymentIntent.status === "requires_payment_method") {
          const errorMessage =
            paymentIntent.last_payment_error?.message ||
            "Your card was declined";

          return {
            statusCode: 400,
            body: JSON.stringify({
              error: `${errorMessage}. Please try a different payment method.`,
            }),
          };
        }

        if (paymentIntent.status === "processing") {
          return {
            statusCode: 200,
            body: JSON.stringify({
              subscriptionId: subscription.id,
              status: "processing",
            }),
          };
        }
      }

      const updatedSubscription = await stripe.subscriptions.retrieve(
        subscription.id,
      );

      if (updatedSubscription.status === "active") {
        return {
          statusCode: 200,
          body: JSON.stringify({
            subscriptionId: subscription.id,
            status: "active",
          }),
        };
      }

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Payment could not be processed. Please try again.",
        }),
      };
    }

    throw new Error("Invalid request parameters");
  } catch (error) {
    if (error.type === "StripeCardError") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            error.message ||
            "Your card was declined. Please try a different payment method.",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
