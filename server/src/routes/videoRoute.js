const express = require("express");

const router = express.Router();
// Create a new Express router to define video-related API routes.

// Import controller functions that handle all main logic
//     for creating, reading, updating, and deleting videos.
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

// Import validation middlewares to ensure requests are valid
//     before being passed to controller functions.
const {
  createVideoValidator,
  getVideoValidator,
  getRandomVideosValidator,
  getVideosValidator,
  updateVideoValidator,
  deleteVideoValidator,
} = require("../utils/validators/videoValidator");

// Import authentication service
//     (used to protect routes and control access by user roles).
const AuthService = require("../controllers/authController");

// Protect all routes below — only authenticated users can access them.
router.use(AuthService.protect);

// Route: POST /videos/random
//     ➤ Returns a random set of videos based on filtering options.
//     ➤ parseJSON: safely parses incoming JSON data.
//     ➤ getRandomVideosValidator: ensures request validity.
router.post("/random", parseJSON, getRandomVideosValidator, getRandomVideos);

// Restrict the following routes to "admin" and "employee" roles only.
router.use(AuthService.allowedTo("admin", "employee"));

// Route group: "/" → for getting all videos or creating a new one.
router
  .route("/")
  // GET /videos → Retrieve all videos from the database (after validation).
  .get(getVideosValidator, getVideos)
  // POST /videos → Upload and create a new video entry.
  //       Steps:
  //       1. uploadVideoFiles → Handle file uploads.
  //       2. parseJSON → Parse additional JSON data (like metadata).
  //       3. createVideoValidator → Validate video data fields.
  //       4. resizeVideoFiles → Resize or process thumbnails.
  //       5. createVideo → Save video to the database.
  .post(
    uploadVideoFiles,
    parseJSON,
    createVideoValidator,
    resizeVideoFiles,
    createVideo
  );

// Route group: "/:id" → for handling specific video operations by ID.
router
  .route("/:id")
  // GET /videos/:id → Fetch a single video by ID (after validation).
  .get(getVideoValidator, getVideo)
  // PUT /videos/:id → Update a video entry.
  //       Includes uploading, parsing, validating, resizing, and saving updates.
  .put(
    uploadVideoFiles,
    parseJSON,
    updateVideoValidator,
    resizeVideoFiles,
    updateVideo
  )
  // DELETE /videos/:id → Delete a specific video (after validation).
  .delete(deleteVideoValidator, deleteVideo);

// Export the router to be used in the main application file (app.js or index.js).
module.exports = router;
