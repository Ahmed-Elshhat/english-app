const express = require("express");

const router = express.Router();
const {
  createEpisodeValidator,
  getEpisodesValidator,
  getEpisodeValidator,
} = require("../utils/validators/episodeValidator");
const {
  createEpisode,
  getEpisodes,
  getEpisode,
} = require("../controllers/episodeController");

router
  .route("/")
  .get(getEpisodesValidator, getEpisodes)
  .post(createEpisodeValidator, createEpisode);

router
  .route("/:id")
  .get(getEpisodeValidator, getEpisode)

module.exports = router;
