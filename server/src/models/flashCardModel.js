const mongoose = require("mongoose");

const flashCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "The flash card title is required"],
      minlength: [3, "The flash card title is too short, min 3  chars"],
      maxlength: [70, "The flash card title is too long, max 70 chars"],
    },
    description: {
      type: String,
      required: [true, "The flash car description is required"],
      minlength: [3, "The flash car description is too short, min 3  chars"],
      maxlength: [70, "The flash car description is too long, max 70 chars"],
    },
    flashCardNumber: {
      type: Number,
      required: [true, "The flash card number is required"],
      default: 1,
    },
    image: {
      type: String,
      required: [true, "The flash card image is required"],
    },
    word: {
      type: String,
      required: [true, "The flash card word is required"],
      minlength: [2, "The flash card word is too short, min 2 chars"],
      maxlength: [20, "The flash card word is too long, max 20 chars"],
    },
    wordType: {
      type: String,
      required: [true, "The flash card word type is required"],
      minlength: [2, "The flash card word type is too short, min 2  chars"],
      maxlength: [40, "The flash card word type is too long, max 40 chars"],
    },
    example: {
      type: String,
      required: [true, "The flash card example is required"],
      minlength: [5, "The flash card example is too short, min 5  chars"],
      maxlength: [200, "The flash card example is too long, max 200 chars"],
    },
    explain: {
      type: String,
      required: [true, "The flash card explain is required"],
      minlength: [5, "The flash card explain is too short, min 5  chars"],
      maxlength: [200, "The flash card explain is too long, max 200 chars"],
    },
    videoId: {
      type: mongoose.Schema.ObjectId,
      ref: "Video",
      required: [true, "The video id for flash card is required"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

flashCardSchema.virtual("imageUrl").get(function () {
  if (this.image) {
    return `${process.env.BASE_URL}/flashCards/${this.image}`;
  }
  return null;
});

// 2- Create model
const FlashCardModel = mongoose.model("FlashCard", flashCardSchema);

module.exports = FlashCardModel;
