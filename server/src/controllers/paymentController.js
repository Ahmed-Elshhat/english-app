const { default: axios } = require("axios");
const asyncHandler = require("express-async-handler");
const Plan = require("../models/planModel");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const verifyPaymobSignature = require("../utils/verifyPaymobSignature");

const SECRET_KEY = process.env.PAYMOB_SECRET_KEY;

const getPaymentIntention = async (amount, user, planType, points) => {
  try {
    const response = await axios.post(
      "https://accept.paymob.com/v1/intention",
      {
        amount: amount * 100,
        currency: "EGP",
        payment_methods: [4871390], // حسب إعداداتك
        items: [
          {
            name: planType,
            amount: amount * 100,
            description: `subscribed in the this plan: ${planType}`,
            quantity: 1,
          },
        ],
        billing_data: {
          first_name: user.name.split(" ")[0],
          last_name: user.name.split(" ")[1] || "",
          email: user.email,
          phone_number: "+201*********",
        },
        extras: {
          userId: user.id,
          planType: planType,
          points,
        },
        expiration: 3600,
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
        },
      }
    );

    // النتيجة تكون غالبًا payment_keys مصفوفة
    const keys = response.data.payment_keys;
    if (!Array.isArray(keys) || !keys.length || !keys[0]?.key) {
      throw new Error("No valid payment key returned from Paymob");
    }
    return keys[0].key;
  } catch (error) {
    console.error(
      "Error getting payment intention:",
      error.response?.data || error.message
    );
    throw new Error("Failed to get payment intention");
  }
};

exports.createPaymentIntention = asyncHandler(async (req, res, next) => {
  const { paymentType } = req.body;
  const points = Number(req.body.points) || null;
  const user = req.user;

  const currentUser = await User.findById(user.id);
  if (!currentUser) return next(new ApiError("User is not found", 404));

  const plan = await Plan.findOne({ type: paymentType });
  if (!plan) return next(new ApiError("Plan not found", 404));

  const premiumPlan = await Plan.findOne({ type: "premium" });
  const premiumPlusPlan = await Plan.findOne({ type: "premium_plus" });

  if (!premiumPlan || !premiumPlusPlan) {
    return next(
      new ApiError(
        "Plan pricing configuration is missing. Please contact support.",
        500
      )
    );
  }

  if (premiumPlan.price >= premiumPlusPlan.price) {
    console.error(
      "⚠️ Invalid pricing detected: Premium is not cheaper than Premium Plus!"
    );
    return next(
      new ApiError(
        "Invalid plan pricing detected. Please contact support.",
        400
      )
    );
  }

  let amount = plan.price;

  const now = new Date();
  const hasActivePlan =
    currentUser.planExpiresAt && new Date(currentUser.planExpiresAt) > now;

  // ✅ لو المستخدم عنده خطة حالية غير منتهية
  if (hasActivePlan) {
    const currentPlan = currentUser.currentPlan;

    // ❌ لو بيحاول يشتري نفس الخطة
    if (currentPlan === paymentType) {
      return next(
        new ApiError(
          `You already have an active ${paymentType} plan. You can upgrade only after it expires.`,
          400
        )
      );
    }

    // ❌ لو بيحاول ينزل من Premium Plus → Premium
    if (currentPlan === "premium_plus" && paymentType === "premium") {
      return next(
        new ApiError(
          "You cannot downgrade from Premium Plus to Premium while your current plan is active.",
          400
        )
      );
    }

    // ✅ لو بيحاول يرقّي من Premium → Premium Plus
    if (currentPlan === "premium" && paymentType === "premium_plus") {
      const oldPlan = premiumPlan;
      if (oldPlan) {
        const expiresAt = new Date(currentUser.planExpiresAt);
        const totalDuration = 30 * 24 * 60 * 60 * 1000; // 30 يوم بالميلي ثانية
        const remainingTime = expiresAt - now;
        const remainingRatio = remainingTime / totalDuration;

        // خصم النسبة المتبقية من الخطة القديمة
        const discount = oldPlan.price * remainingRatio;
        const newAmount = plan.price - discount;

        amount = Math.max(newAmount, 1);

        console.log(
          `🔄 Upgrade Premium → Premium Plus | Remaining: ${(remainingRatio * 100).toFixed(1)}% | Discount: ${discount.toFixed(2)} | Final: ${amount.toFixed(2)}`
        );
      }
    }
  }

  // ✅ إنشاء نية الدفع
  const paymentKey = await getPaymentIntention(
    amount,
    user,
    paymentType,
    points
  );

  const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/879841?payment_token=${paymentKey}`;

  res.status(200).json({ url: paymentUrl });
});

async function getAuthToken() {
  const response = await axios.post(
    "https://accept.paymob.com/api/auth/tokens",
    {
      api_key: process.env.PAYMOB_API_KEY, // مش SECRET_KEY
    }
  );
  return response.data.token;
}

async function refundPayment(transactionId, amountCents) {
  try {
    // "https://accept.paymob.com/v1/intention/refund",
    const token = await getAuthToken();
    const response = await axios.post(
      "https://accept.paymob.com/api/acceptance/void_refund/refund",
      {
        transaction_id: transactionId,
        amount_cents: amountCents,
        reason: "Auto refund due to failed callback process",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("💸 Refund successful:", response.data);
  } catch (err) {
    console.error("❌ Refund failed:", err.response?.data || err.message);
  }
}

exports.callbackPayment = asyncHandler(async (req, res, next) => {
  try {
    // const isValid = verifyPaymobSignature(req);
    // if (!isValid) {
    //   console.error("❌ Invalid HMAC signature - possible fake callback!");
    //   return next(new ApiError("Invalid HMAC signature", 403));
    // }

    const obj = req.body.obj;
    console.log("🟢 Paymob Callback Received");

    if (!obj.success) {
      throw new ApiError("Payment not successful", 402);
    }

    // استخراج البيانات من extras
    const extras = obj?.payment_key_claims?.extra || {};
    const userId = extras.userId;
    const planType = extras.planType;
    if (!userId || !planType || Object.keys(extras).length === 0) {
      throw new ApiError("Missing data — refunded.", 400);
    }

    const durationDays = 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    try {
      const user = await User.findById(userId);

      if (!user) {
        console.warn("⚠️ User not found, refunding payment...");
        throw new ApiError("User not found — refunded.", 404);
      }

      // ✅ لو الخطة Premium أو Premium Plus
      if (planType === "premium" || planType === "premium_plus") {
        user.currentPlan = planType;
        user.planPurchasedAt = new Date();
        user.planExpiresAt = expiresAt;

        console.log(`✅ User upgraded to ${planType} plan for 30 days`);
      } else if (planType === "points") {
        const pointsToAdd = Number(extras.points) || 0;
        user.points = (user.points || 0) + pointsToAdd;

        console.log(`🎯 Added ${pointsToAdd} points to user`);

        // لو الاشتراك منتهي، رجعه Free
        if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
          user.currentPlan = "free";
          user.planPurchasedAt = undefined;
          user.planExpiresAt = undefined;
          console.log("🔁 Subscription expired — reverted to Free plan");
        }
      }

      await user.save();
      console.log("✅ User updated successfully");
    } catch (err) {
      console.error("❌ Failed to update user:", err.message);
      throw new ApiError("Database update failed — refunded.", 500);
    }

    return res
      .status(200)
      .json({ success: true, message: "Payment processed successfully" });
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
    const obj = req.body?.obj || {};
    if (obj.success && obj.id && obj.amount_cents) {
      console.log("deleted");
      await refundPayment(obj.id, obj.amount_cents);
    }
    return next(err);
  }
});
