const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema(
  {
    accessToken: String,
    facebookAccessToken: String,
    googleId:String,
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
    startShift: {
      hour: Number,
      minutes: Number,
    },
    endShift: {
      hour: Number,
      minutes: Number,
    },
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
      enum: ["employee"],
      default: "employee",
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const EmployeeModel = mongoose.model("Employee", employeeSchema);

module.exports = EmployeeModel;
