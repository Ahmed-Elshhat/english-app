const express = require("express");

const router = express.Router();
const {
  createEpisodeValidator,
  getEpisodesValidator,
  getEpisodeValidator,
  updateEpisodeValidator,
  deleteEpisodeValidator,
} = require("../utils/validators/episodeValidator");
const {
  createEpisode,
  getEpisodes,
  getEpisode,
  updateEpisode,
  deleteEpisode,
} = require("../controllers/episodeController");

router
  .route("/")
  .get(getEpisodesValidator, getEpisodes)
  .post(createEpisodeValidator, createEpisode);

router
  .route("/:id")
  .get(getEpisodeValidator, getEpisode)
  .put(updateEpisodeValidator, updateEpisode)
  .delete(deleteEpisodeValidator, deleteEpisode);

module.exports = router;
