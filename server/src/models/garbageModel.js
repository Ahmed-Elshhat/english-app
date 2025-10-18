const mongoose = require("mongoose");

const garbageSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: "Unknown",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const GarbageModel = mongoose.model("Garbage", garbageSchema);

module.exports = GarbageModel;
