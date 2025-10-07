const express = require("express");

const router = express.Router();

// Import validation middlewares for episode routes (ensure request data is valid)
const {
  createEpisodeValidator,
  getEpisodesValidator,
  getEpisodeValidator,
  updateEpisodeValidator,
  deleteEpisodeValidator,
} = require("../utils/validators/episodeValidator");

// Import controller functions (handle business logic for each route)
const {
  createEpisode,
  getEpisodes,
  getEpisode,
  updateEpisode,
  deleteEpisode,
} = require("../controllers/episodeController");

// Import authentication service (used to protect routes and restrict access by role)
const AuthService = require("../controllers/authController");

// Protect all routes below — only allow users with roles "admin" or "employee"
router.use(AuthService.protect, AuthService.allowedTo("admin", "employee"));

// Route: /episodes → Used for fetching all episodes or creating a new one
router
  .route("/")
  // GET /episodes → Retrieve all episodes (after validation)
  .get(getEpisodesValidator, getEpisodes)
  // POST /episodes → Create a new episode (after validation)
  .post(createEpisodeValidator, createEpisode);

// Route: /episodes/:id → Used for fetching, updating, or deleting a single episode by ID
router
  .route("/:id")
  // GET /episodes/:id → Get a specific episode (after validation)
  .get(getEpisodeValidator, getEpisode)
  // PUT /episodes/:id → Update an existing episode (after validation)
  .put(updateEpisodeValidator, updateEpisode)
  // DELETE /episodes/:id → Delete an episode (after validation)
  .delete(deleteEpisodeValidator, deleteEpisode);

// Export the router to be used in the main app
module.exports = router;
