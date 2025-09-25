const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "The episode title is required"],
      minlength: [3, "The episode title is too short, min 3  chars"],
      maxlength: [70, "The episode title is too long, max 70 chars"],
      unique: [true, "The episode title must be unique"]
    },
    duration: {
      type: Number,
      default: 0,
    },
    episodeNumber: {
      type: Number,
      required: [true, "The episode number is required"],
      default: 1,
    },
    playlistId: {
      type: mongoose.Schema.ObjectId,
      ref: "Playlist",
      required: [true, "Episode must be belong to playlist"],
    },
    seasonNumber: {
      type: Number,
      required: [true, "The season number is required"],
      default: 1,
    },
  },
  { timestamps: true }
);

// 2- Create model
const EpisodeModel = mongoose.model("Episode", episodeSchema);

module.exports = EpisodeModel;
