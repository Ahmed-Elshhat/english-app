const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");
const ApiError = require("../apiError");

exports.createPaymentIntentionValidator = [
  validateExactFields(["paymentType", "points"], [], []),

  // ✅ التحقق من نوع الدفع
  check("paymentType")
    .notEmpty()
    .withMessage("The payment type is required")
    .isString()
    .withMessage("The payment type must be a string")
    .isIn(["points", "premium", "premium_plus"])
    .withMessage(
      "The payment type must be either 'points', 'premium', or 'premium_plus'"
    ),

  // ✅ تحقق من النقاط
  check("points").custom((value, { req }) => {
    const paymentType = req.body.paymentType;
    const points = Number(value);

    if (paymentType === "points") {
      if (value === undefined || value === null || value === "") {
        throw new ApiError("Points are required when purchasing points.", 400);
      }
      if (isNaN(points) || points <= 0 || points % 5 !== 0) {
        throw new ApiError(
          "Points must be a positive number and a multiple of 5 (e.g., 5, 10, 15, 20, ...).",
          400
        );
      }
    }

    if (
      (paymentType === "premium" || paymentType === "premium_plus") &&
      value
    ) {
      throw new ApiError(
        "Points are not allowed when purchasing premium plans.",
        400
      );
    }

    return true;
  }),

  validatorMiddleware,
];
