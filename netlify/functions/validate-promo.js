import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { promoCode, priceId } = JSON.parse(event.body);

    if (!promoCode || !priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required parameters" }),
      };
    }

    const price = await stripe.prices.retrieve(priceId);
    const originalAmount = price.unit_amount / 100;

    const promoCodes = await stripe.promotionCodes.list({
      code: promoCode.toUpperCase(),
      active: true,
      limit: 1,
      expand: ["data.coupon"],
    });

    if (promoCodes.data.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          valid: false,
          error: "Invalid promotion code",
        }),
      };
    }

    const promoCodeObj = promoCodes.data[0];

    const couponId =
      typeof promoCodeObj.promotion === "object"
        ? promoCodeObj.promotion.coupon
        : promoCodeObj.coupon;

    const coupon = await stripe.coupons.retrieve(couponId);

    // eslint-disable-next-line no-console
    console.log("Coupon details:", coupon);
    if (
      promoCodeObj.expires_at &&
      promoCodeObj.expires_at < Math.floor(Date.now() / 1000)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          valid: false,
          error: "This promotion code has expired",
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
          valid: false,
          error: "This promotion code has reached its maximum redemptions",
        }),
      };
    }

    let discountAmount = 0;
    let newAmount = originalAmount;

    if (coupon.percent_off) {
      discountAmount = (originalAmount * coupon.percent_off) / 100;
      newAmount = originalAmount - discountAmount;
    } else if (coupon.amount_off) {
      discountAmount = coupon.amount_off / 100;
      newAmount = Math.max(0, originalAmount - discountAmount);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        originalAmount,
        discountAmount,
        newAmount,
        percentOff: coupon.percent_off,
        amountOff: coupon.amount_off ? coupon.amount_off / 100 : null,
        currency: price.currency,
      }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Promo validation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        valid: false,
        error: "Error validating promotion code",
      }),
    };
  }
};
