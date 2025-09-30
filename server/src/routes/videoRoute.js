const express = require("express");

const router = express.Router();

const {
  createVideo,
  parseJSON,
  uploadVideoFiles,
  resizeVideoFiles,
  getVideos,
  getVideo,
  getRandomVideos,
  updateVideo,
} = require("../controllers/videoController");
const {
  createVideoValidator,
  getVideoValidator,
  getRandomVideosValidator,
  getVideosValidator,
  updateVideoValidator,
} = require("../utils/validators/videoValidator");

router.post("/random", parseJSON, getRandomVideosValidator, getRandomVideos);

router
  .route("/")
  .get(getVideosValidator, getVideos)
  .post(
    uploadVideoFiles,
    parseJSON,
    createVideoValidator,
    resizeVideoFiles,
    createVideo
  );

router
  .route("/:id")
  .get(getVideoValidator, getVideo)
  .put(
    "/:id",
    uploadVideoFiles,
    parseJSON,
    updateVideoValidator,
    resizeVideoFiles,
    updateVideo
  );

module.exports = router;
