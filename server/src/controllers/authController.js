const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const SignupTracker = require("../models/signupTrackerModel");
const createToken = require("../utils/createToken");
const sendEmail = require("../utils/sendEmail");
const Employee = require("../models/employeeModel");

// @desc    Signup
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  // Step 1: Extract user's IP address (supports both proxies and direct connections)
  let ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim();

  // Step 2: Convert IPv6 (::ffff:127.0.0.1) to IPv4 (127.0.0.1)
  ip = ip.replace("::ffff:", "");
  if (ip === "::1") ip = "127.0.0.1";

  // Step 3: Check if this IP or email already signed up before
  const previousSignup = await SignupTracker.findOne({
    $or: [{ ipAddress: ip }, { email: req.body.email }],
  });

  // Step 4: Decide whether to give trial points (first-time users only)
  const shouldGiveTrialPoints = !previousSignup;

  // Step 5: Create the new user document
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    points: shouldGiveTrialPoints ? 5 : 0, // Give 5 free points for first signup
  });

  // Step 6: Record signup attempt or update existing record
  if (shouldGiveTrialPoints) {
    await SignupTracker.create({
      email: req.body.email,
      ipAddress: ip,
    });
  } else {
    let save = false;
    if (previousSignup.email == null) {
      previousSignup.email = req.body.email;
      save = true;
    }
    if (previousSignup.ipAddress == null) {
      previousSignup.ipAddress = ip;
      save = true;
    }
    if (save) {
      await previousSignup.save();
    }
  }

  // Step 7: Generate JWT token for authentication
  const token = createToken({ userId: user._id, role: "user" });

  // Step 8: Prepare user object for response (remove sensitive fields)
  const userObject = user.toObject();
  userObject.id = user._id;
  delete userObject.password;
  delete userObject?.accessToken;
  delete userObject.__v;
  delete userObject._id;

  // Step 9: Send success response with token
  res.status(201).json({ user: userObject, token });
});

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // Step 1: Find user by email (check both collections)
  let user = await User.findOne({ email: req.body.email });
  if (!user) user = await Employee.findOne({ email: req.body.email });

  // Step 2: Validate password
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  // Step 3: Generate JWT token
  const token = createToken({ userId: user._id, role: user.role });

  // Step 4: Sanitize user data before sending response
  const userObject = user.toObject();
  userObject.id = user._id;
  delete userObject.password;
  delete userObject?.accessToken;
  delete userObject.__v;
  delete userObject._id;

  // Step 5: Send response with user and token
  res.status(200).json({ user: userObject, token });
});

// @desc    Login with google and return token
// @route   GET /api/v1/auth/google/callback
// @access  Public
exports.googleCallback = asyncHandler(async (req, res) => {
  // Step 1: Get authenticated user from Passport
  const user = req.user;

  // Step 2: Generate JWT token for user
  const token = createToken({ userId: user.id, role: user.role });

  // Step 3: Set token in browser cookie
  res.cookie("ARL", token, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    path: "/",
  });

  // Step 4: Log user out from Passport session
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }

    // Step 5: Destroy session and redirect to frontend
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("http://localhost:3000");
    });
  });
});

// @desc    Login with facebook and return token
// @route   GET /api/v1/auth/facebook/callback
// @access  Public
exports.facebookCallback = asyncHandler(async (req, res) => {
  // Step 1: Retrieve authenticated user from Passport
  const user = req.user;

  // Step 2: Generate JWT token for user
  const token = createToken({ userId: user.id, role: user.role });

  // Step 3: Store token in cookie
  res.cookie("ARL", token, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    path: "/",
  });

  // Step 4: Logout from Passport session
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }

    // Step 5: Destroy session and redirect to frontend
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("http://localhost:3000");
    });
  });
});

// @desc Make sure the user is logged in
// @middleware Protect
exports.protect = asyncHandler(async (req, res, next) => {
  // Step 1: Extract JWT token from Authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Step 2: If no token found, deny access
  if (!token) {
    return next(
      new ApiError(
        "You are not logged in. Please log in to access this route.",
        401
      )
    );
  }

  // Step 3: Verify token and decode payload
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // Step 4: Find user from decoded ID (check both models)
  let currentUser = null;
  if (decoded?.role === "user" || decoded?.role === "admin") {
    currentUser = await User.findById(decoded.userId);
  } else if (decoded?.role === "employee") {
    currentUser = await Employee.findById(decoded.userId);
  }

  // Step 5: If user no longer exists, deny access
  if (!currentUser) {
    return next(
      new ApiError("The user belonging to this token no longer exists.", 401)
    );
  }

  // Step 6: Check if user changed password after token was issued
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed their password. Please log in again.",
          401
        )
      );
    }
  }

  // Step 7: Clean up user object (remove sensitive fields)
  const userObject = currentUser.toObject();
  userObject.id = currentUser._id;
  delete userObject.password;
  delete userObject?.accessToken;
  delete userObject.__v;
  delete userObject._id;

  // Step 8: Attach user to request
  req.user = userObject;

  // Step 9: Continue to next middleware
  next();
});

// @desc Allow certain roles to access certain routes
// @middleware Authorization
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // Step 1: Extract user role
    let userRole = req.user.role;

    // Step 2: Check if role is allowed
    if (!roles.includes(userRole)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }

    // Step 3: Continue to next handler
    next();
  });

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Step 1: Find user by email (User or Employee)
  let user = await User.findOne({ email: req.body.email });
  if (!user) user = await Employee.findOne({ email: req.body.email });

  // Step 2: If no user found, return error
  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }

  // Step 3: Generate random 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Step 4: Hash the reset code for secure storage
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Step 5: Save hashed code and expiration (5 minutes)
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  // Step 6: Prepare HTML email with reset code
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333;">🔐 Reset Your Password</h2>
      <p style="font-size: 16px; color: #666;">Hi <strong>${user.name}</strong>,</p>
      <p style="font-size: 16px; color: #666;">We received a request to reset the password on your <strong>E-shop</strong> account.</p>
      <p style="font-size: 18px; font-weight: bold; background: #007bff; color: white; padding: 10px; border-radius: 5px; display: inline-block;">
        ${resetCode}
      </p>
      <p style="font-size: 16px; color: #666;">Enter this code to complete the reset.</p>
      <p style="font-size: 14px; color: #999;">Thanks for helping us keep your account secure.</p>
      <p style="font-size: 14px; color: #007bff; font-weight: bold;">The E-shop Team</p>
    </div>
  </div>
`;

  // Step 7: Send email or handle failure
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  // Step 8: Send success response
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // Step 1: Hash reset code received from user
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // Step 2: Find user with valid reset code (not expired)
  let user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    user = await Employee.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });
  }

  // Step 3: If invalid or expired, return error
  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // Step 4: Mark reset code as verified
  user.passwordResetVerified = true;
  await user.save();

  // Step 5: Send success response
  res.status(200).json({ status: "Success" });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Step 1: Hash the provided reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // Step 2: Find user by email
  let user = await User.findOne({ email: req.body.email });
  if (!user) user = await Employee.findOne({ email: req.body.email });

  // Step 3: Handle invalid email case
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  // Step 4: Validate reset code
  if (user.passwordResetCode !== hashedResetCode) {
    return next(new ApiError(`Invalid password reset code.`, 404));
  }

  // Step 5: Check expiration
  if (!user.passwordResetExpires || user.passwordResetExpires < Date.now()) {
    return next(new ApiError("Reset code has expired", 400));
  }

  // Step 6: Ensure code was verified first
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  // Step 7: Update password and clear reset fields
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // Step 8: Generate new token for user after successful reset
  const token = createToken({ userId: user._id, role: user.role });

  // Step 9: Send success response with new token
  res.status(200).json({ token });
});
