const mongoose = require("mongoose");

const signupTrackerSchema = new mongoose.Schema(
  {
    emails: {
      type: [String],
      default: [],
    },
    ipAddresses: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const SignupTrackerModel = mongoose.model("SignupTracker", signupTrackerSchema);

module.exports = SignupTrackerModel;
