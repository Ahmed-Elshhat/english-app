const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const User = require("../models/userModel");
const Employee = require("../models/employeeModel");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

// @desc    Get list of users
// @route    GET /api/v1/users
// @access    Private
exports.getUsers = factory.getAll(User, "Users");

// @desc    Get specific user by id
// @route    GET /api/v1/users/:id
// @access    Private
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route    POST /api/v1/users
// @access    Private
exports.createUser = factory.createOne(User, "Users");

// @desc    Update specific user
// @route    PUT /api/v1/users/:id
// @access    protected
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const points = req.body.points != null ? Number(req.body.points) : null;
  const currentUser = req.user;

  let user = await User.findById(id);

  if (!user) {
    user = await Employee.findById(id);
  }

  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  if (name != null && String(currentUser.id) !== id) {
    return next(
      new ApiError("You are not allowed to change this user's name", 400)
    );
  }

  if (points != null) {
    const isNotAdmin = currentUser.role !== "admin";
    const targetIsAdminOrEmp = ["employee", "admin"].includes(user.role);
    if (isNotAdmin || targetIsAdminOrEmp) {
      return next(new ApiError("You are not allowed to change points", 400));
    }
  }

  if (name != null) user.name = name;
  if (points != null) user.points = points;

  await user.save();

  const documentObject = user.toObject();
  delete documentObject.accessToken;
  delete documentObject.password;
  delete documentObject.__v;

  res.status(200).json({ data: documentObject });
});

// @desc    Change password specific user
// @route    PUT /api/v1/users/changePassword
// @access    protected
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.password) {
    return next(new ApiError("Password is required to update", 400));
  }

  let user = await User.findByIdAndUpdate(
    req.user.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  ).select("-password -accessToken");

  if (!user) {
    user = await Employee.findByIdAndUpdate(
      req.user.id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      { new: true }
    ).select("-password -accessToken");
  }

  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  const token = createToken({ userId: user._id, role: user.role });

  res.status(200).json({ data: user, token });
});

// @desc    Send change email verify code
// @route    PUT /api/v1/users/sendChangeEmailVerifyCode
// @access    protected
exports.sendChangeEmailVerifyCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  let currentUser = req.user;

  let user = null;
  if (["user", "admin"].includes(currentUser.role)) {
    user = await User.findOne({ email: currentUser.email });
  }

  if (currentUser.role === "employee") {
    user = await Employee.findOne({ email: currentUser.email });
  }

  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${currentUser.email}`, 404)
    );
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.emailResetCode = hashedResetCode;
  // Add expiration time for email reset code (10 min)
  user.emailResetExpires = Date.now() + 10 * 60 * 1000;
  user.newEmail = email;

  await user.save();

  // 3) Send the reset code via email
  const message = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #333;">📧 Verify Your New Email</h2>
      <p style="font-size: 16px; color: #666;">Hi <strong>${user.name}</strong>,</p>
      <p style="font-size: 16px; color: #666;">We received a request to change the email address on your <strong>Arablish</strong> account.</p>
      <p style="font-size: 18px; font-weight: bold; background: #007bff; color: white; padding: 10px; border-radius: 5px; display: inline-block;">
        ${resetCode}
      </p>
      <p style="font-size: 16px; color: #666;">Enter this code to confirm your new email address.</p>
      <p style="font-size: 14px; color: #999;">If you didn’t request this, please ignore this message.</p>
      <p style="font-size: 14px; color: #007bff; font-weight: bold;">The E-shop Team</p>
    </div>
  </div>
`;

  try {
    await sendEmail({
      email,
      subject: "Your email change verification code (valid for 10 min)",
      message,
    });
  } catch (err) {
    // 4) clear reset token data
    user.emailResetCode = undefined;
    user.emailResetExpires = undefined;
    user.newEmail = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Verification code sent to email" });
});

// @desc    Verify change email code
// @route    PUT /api/v1/users/verifyChangeEmailCode
// @access    protected
exports.verifyChangeEmailCode = asyncHandler(async (req, res, next) => {
  const { resetCode } = req.body;
  const currentUser = req.user;
  // 1) Hash the reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  let user = null;
  // 2) Get user based on reset code
  if (["user", "admin"].includes(currentUser.role)) {
    user = await User.findOne({
      emailResetCode: hashedResetCode,
      emailResetExpires: { $gt: Date.now() },
    });
  }

  if (currentUser.role === "employee") {
    user = await Employee.findOne({
      emailResetCode: hashedResetCode,
      emailResetExpires: { $gt: Date.now() },
    });
  }

  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  user.email = user.newEmail;
  user.newEmail = undefined;
  user.emailResetCode = undefined;
  user.emailResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc    Delete specific user
// @route    PUT /api/v1/users/:id
// @access    Private
exports.deleteUser = factory.deleteOne(User);


// @desc    Get user with token
// @route    Get /api/v1/users/getOne
// @access    protect
exports.getOneWithToken = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});
