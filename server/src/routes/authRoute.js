const express = require("express");

const router = express.Router();
const passport = require("passport");

// Import input validators for different auth routes
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyPassResetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidator");

// Import controller functions that handle authentication logic
const {
  signup,
  login,
  googleCallback,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
  facebookCallback,
} = require("../controllers/authController");

// ====================== Authentication Routes ======================

// Register a new user
router.route("/signup").post(signupValidator, signup);

// Log in an existing user
router.route("/login").post(loginValidator, login);

// Send a password reset code to the user's email
router.post("/forgotPassword", forgotPasswordValidator, forgotPassword);

// Verify the reset code sent to the user's email
router.post(
  "/verifyResetCode",
  verifyPassResetCodeValidator,
  verifyPassResetCode
);

// Reset password after verifying the reset code
router.put("/resetPassword", resetPasswordValidator, resetPassword);

// ====================== Google Authentication ======================

// Redirect user to Google login page
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // Request access to user's profile and email
    prompt: "consent", // Force Google to show consent screen each time
  })
);

// Handle callback from Google after successful or failed authentication
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-failed", // Redirect here if authentication fails
  }),
  googleCallback // Run this controller if authentication succeeds
);

// ====================== Facebook Authentication ======================

// Redirect user to Facebook login page
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

// Handle callback from Facebook after authentication
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login-failed", // Redirect if login fails
  }),
  facebookCallback // Run this controller if login succeeds
);

module.exports = router;
