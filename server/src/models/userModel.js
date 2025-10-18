const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    accessToken: String,
    facebookAccessToken: String,
    googleId: String,
    facebookId: String,
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email must be unique"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "Too short password"],
    },
    currentPlan: {
      type: String,
      enum: ["free", "premium", "premium_plus"],
      default: "free",
    },
    planPurchasedAt: {
      type: Date,
    },
    planExpiresAt: {
      type: Date,
    },
    points: Number,
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    emailResetCode: String,
    emailResetExpires: Date,

    newEmail: {
      type: String,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
