const mongoose = require("mongoose");

const signupTrackerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SignupTrackerModel = mongoose.model("SignupTracker", signupTrackerSchema);

module.exports = SignupTrackerModel;
