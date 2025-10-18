const express = require("express");
const AuthService = require("../controllers/authController");
const {
  createPaymentIntention,
} = require("../controllers/paymentController");
const {
  createPaymentIntentionValidator,
} = require("../utils/validators/paymentValidator");

const router = express.Router();

// ✅ إنشاء نية الدفع
router.post(
  "/create-payment-intention",
  AuthService.protect,
  AuthService.allowedTo("user"),
  createPaymentIntentionValidator,
  createPaymentIntention
);

module.exports = router;
