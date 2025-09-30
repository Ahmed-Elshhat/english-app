const express = require("express");

const router = express.Router();
const {
  createPlaylistValidator,
  getPlaylistsValidator,
  getPlaylistValidator,
  deletePlaylistValidator,
  updatePlaylistValidator,
  getRandomPlaylistsValidator,
} = require("../utils/validators/playlistValidator");

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

/**
 * @route   POST /random
 * @desc    Get random playlists filtered by type and excluding given IDs
 * @access  Public/Custom (depends on controller logic)
 */
router.post(
  "/random/",
  parseJSON,
  getRandomPlaylistsValidator,
  getRandomPlaylists
);

/**
 * @route   / (root playlist routes)
 * @desc    GET    -> Fetch all playlists with filters/pagination
 *          POST   -> Create a new playlist with image upload and validation
 */
router
  .route("/")
  .get(getPlaylistsValidator, getPlaylists)
  .post(
    uploadPlaylistImage,
    parseJSON,
    resizeImage,
    createPlaylistValidator,
    createPlaylist
  );

/**
 * @route   /:id
 * @desc    GET    -> Fetch a single playlist by ID
 *          PUT    -> Update playlist details with optional image upload
 *          DELETE -> Remove playlist by ID
 */
router
  .route("/:id")
  .get(getPlaylistValidator, getPlaylist)
  .put(
    uploadPlaylistImage,
    resizeImage,
    parseJSON,
    updatePlaylistValidator,
    updatePlaylist
  )
  .delete(deletePlaylistValidator, deletePlaylist);

module.exports = router;
