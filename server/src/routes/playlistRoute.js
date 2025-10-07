const express = require("express");

const router = express.Router();

// Import all playlist validators to ensure input data is correct
const {
  createPlaylistValidator,
  getPlaylistsValidator,
  getPlaylistValidator,
  deletePlaylistValidator,
  updatePlaylistValidator,
  getRandomPlaylistsValidator,
} = require("../utils/validators/playlistValidator");

// 2️⃣ Import playlist controller functions that handle business logic
const {
  parseJSON,
  createPlaylist,
  uploadPlaylistImage,
  resizeImage,
  getPlaylists,
  getPlaylist,
  deletePlaylist,
  updatePlaylist,
  getRandomPlaylists,
} = require("../controllers/playlistController");

// Import authentication service for protecting routes and role management
const AuthService = require("../controllers/authController");

// Apply authentication middleware so only logged-in users can access any playlist route
router.use(AuthService.protect);

// Public endpoint (for logged-in users) to get random playlists —
//     typically used for recommendations or random selections
router.post(
  "/random/",
  parseJSON, // Middleware to safely parse incoming JSON (if nested objects exist)
  getRandomPlaylistsValidator, // Validate request body/query before processing
  getRandomPlaylists // Controller: fetch random playlists from database
);

// Restrict the following routes to admin users only
router.use(AuthService.allowedTo("admin"));

// Routes for fetching and creating playlists
router
  .route("/")
  // Get all playlists (admin only)
  .get(getPlaylistsValidator, getPlaylists)
  // Create a new playlist (admin only)
  .post(
    uploadPlaylistImage, // Upload cover image for the playlist
    parseJSON, // Parse JSON fields that may contain nested data (like song list)
    resizeImage, // Resize and optimize the uploaded image
    createPlaylistValidator, // Validate playlist data (title, description, etc.)
    createPlaylist // Controller: save playlist to database
  );

// Routes for single playlist operations (by ID)
router
  .route("/:id")
  // Get one playlist by ID (admin only)
  .get(getPlaylistValidator, getPlaylist)
  // Update an existing playlist
  .put(
    uploadPlaylistImage, // Upload new image if provided
    resizeImage, // Resize the image
    parseJSON, // Parse JSON fields before validation
    updatePlaylistValidator, // Validate fields before updating
    updatePlaylist // Controller: update playlist in database
  )
  // Delete playlist by ID
  .delete(deletePlaylistValidator, deletePlaylist);

// Export router to be used in the main application
module.exports = router;
