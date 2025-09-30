const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "The video title is required"],
      minlength: [3, "The video title is too short, min 3  chars"],
      maxlength: [70, "The video title is too long, max 70 chars"],
      unique: [true, "The video title must be unique"],
    },
    description: {
      type: String,
      required: [true, "The video description is required"],
      minlength: [3, "The video description is too short, min 3  chars"],
      maxlength: [100, "The video description is too long, max 100 chars"],
    },
    duration: {
      type: Number,
      required: [true, "Video duration is required"],
    },
    durationFormatted: {
      type: String,
      required: [true, "Formatted video duration is required"],
    },
    image: {
      type: String,
      required: [true, "The video image is required"],
    },
    video: {
      type: String,
      required: [true, "The video path is required"],
    },
    playlistId: {
      type: mongoose.Schema.ObjectId,
      ref: "Playlist",
      required: [true, "Video must be belong to playlist"],
    },
    seasonNumber: {
      type: Number,
      required: [true, "The season number is required"],
      default: 1,
    },
    episodeId: {
      type: mongoose.Schema.ObjectId,
      ref: "Playlist",
    },
    videoNumber: {
      type: Number,
      required: [true, "The video number is required"],
      default: 1,
    },
    subtitleEn: {
      type: String,
      required: [true, "The video english subtitle is required"],
    },
    subtitleAr: {
      type: String,
      required: [true, "The video arabic subtitle is required"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

videoSchema.virtual("flashCards", {
  ref: "FlashCard",
  foreignField: "videoId",
  localField: "_id",
});

videoSchema.virtual("quizzes", {
  ref: "Quiz",
  foreignField: "videoId",
  localField: "_id",
});

videoSchema.virtual("imageUrl").get(function () {
  if (this.image) {
    return `${process.env.BASE_URL}/videosImages/${this.image}`;
  }
  return null;
});

videoSchema.virtual("videoUrl").get(function () {
  if (this.video) {
    return `${process.env.BASE_URL}/videos/${this.video}`;
  }
  return null;
});

// 2- Create model
const VideoModel = mongoose.model("Video", videoSchema);

module.exports = VideoModel;
