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
  deleteVideo,
} = require("../controllers/videoController");
const {
  createVideoValidator,
  getVideoValidator,
  getRandomVideosValidator,
  getVideosValidator,
  updateVideoValidator,
  deleteVideoValidator,
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
    uploadVideoFiles,
    parseJSON,
    updateVideoValidator,
    resizeVideoFiles,
    updateVideo
  )
  .delete(deleteVideoValidator, deleteVideo);

module.exports = router;
