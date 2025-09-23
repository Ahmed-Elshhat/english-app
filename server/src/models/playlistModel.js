const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["series", "movie"],
      required: [true, "The playlist type is required"],
    },
    title: {
      type: String,
      required: [true, "The playlist title is required"],
      minlength: [3, "The playlist title is too short, min 3  chars"],
      maxlength: [70, "The playlist title is too long, max 70 chars"],
    },
    description: {
      type: String,
      required: [true, "The playlist description is required"],
      minlength: [3, "The playlist description is too short, min 3  chars"],
      maxlength: [100, "The playlist description is too long, max 100 chars"],
    },
    image: {
      type: String,
      required: [true, "The playlist image is required"],
    },
    seasons: [
      {
        seasonNumber: {
          type: Number,
          required: [true, "The season number is required"],
          default: 1,
        },
        countOfEpisodes: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

playlistSchema.virtual("imageUrl").get(function () {
  if (this.image) {
    return `${process.env.BASE_URL}/playlists/${this.image}`;
  }
  return null;
});

// 2- Create model
const PlaylistModel = mongoose.model("Playlist", playlistSchema);

module.exports = PlaylistModel;
