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

router.post("/random/", parseJSON, getRandomPlaylistsValidator, getRandomPlaylists);

router
  .route("/")
  .get(getPlaylistsValidator, getPlaylists)
  .post(
    uploadPlaylistImage,
    resizeImage,
    parseJSON,
    createPlaylistValidator,
    createPlaylist
  );

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
