const express = require("express");

const router = express.Router();
const passport = require("passport");
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyPassResetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");

const {
  signup,
  login,
  googleCallback,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  facebookCallback,
} = require("../controllers/authController");

router.route("/signup").post(signupValidator, signup);
router.route("/login").post(loginValidator, login);
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);
router.post(
  "/verifyResetCode",
  verifyPassResetCodeValidator,
  verifyPassResetCode
);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

// Sign in with google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "consent",
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-failed",
  }),
  googleCallback
);

// =============== Facebook Login ===============
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login-failed",
  }),
  facebookCallback
);

module.exports = router;
