const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "title is required"],
    },
    type: {
      type: String,
      trim: true,
      required: [true, "title is required"],
    },
    price: {
      type: Number,
      required: [true, "title is required"],
    },
    features: {
      type: [String],
      required: [true, "features are required"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "features must contain at least one item",
      },
    },
  },
  { timestamps: true }
);

const PlanModel = mongoose.model("Plan", planSchema);

module.exports = PlanModel;
