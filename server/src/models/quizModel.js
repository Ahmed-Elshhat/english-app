const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "The quiz title is required"],
      minlength: [3, "The quiz title is too short, min 3  chars"],
      maxlength: [70, "The quiz title is too long, max 70 chars"],
    },
    quizNumber: {
      type: Number,
      required: [true, "The quiz number is required"],
      default: 1,
    },
    image: {
      type: String,
      required: [true, "The quiz image is required"],
    },
    videoId: {
      type: mongoose.Schema.ObjectId,
      ref: "Video",
      required: [true, "The video id for quiz is required"],
    },
    questions: [
      {
        questionEn: {
          type: String,
          required: [true, "The english question is required"],
          minlength: [3, "The english question is too short, min 3  chars"],
          maxlength: [70, "The english question is too long, max 70 chars"],
        },
        questionAr: {
          type: String,
          required: [true, "The arabic question is required"],
          minlength: [3, "The arabic question is too short, min 3  chars"],
          maxlength: [70, "The arabic question is too long, max 70 chars"],
        },
        word: {
          type: String,
          required: [true, "The question word is required"],
          minlength: [2, "The question word is too short, min 2 chars"],
          maxlength: [20, "The question word is too long, max 20 chars"],
        },
        rightAnswer: {
          type: String,
          required: [true, "The question word is required"],
          minlength: [1, "The question word is too short, min 1 chars"],
          maxlength: [1, "The question word is too long, max 1 chars"],
        },
        answers: [
          {
            answerEn: {
              type: String,
              required: [true, "The english answer is required"],
              minlength: [3, "The english answer is too short, min 3 chars"],
              maxlength: [100, "The english answer is too long, max 100 chars"],
            },
            answerAr: {
              type: String,
              required: [true, "The arabic answer is required"],
              minlength: [3, "The arabic answer is too short, min 3 chars"],
              maxlength: [100, "The arabic answer is too long, max 100 chars"],
            },
            character: {
              type: String,
              required: [true, "The answer character is required"],
              minlength: [1, "The answer character is too short, min 1 chars"],
              maxlength: [1, "The answer character is too long, max 1 chars"],
            },
          },
        ],
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

quizSchema.virtual("imageUrl").get(function () {
  if (this.image) {
    return `${process.env.BASE_URL}/quizzes/${this.image}`;
  }
  return null;
});

// 2- Create model
const QuizModel = mongoose.model("Quiz", quizSchema);

module.exports = QuizModel;
