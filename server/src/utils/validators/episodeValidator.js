const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");
const Playlist = require("../../models/playlistModel");
const Episode = require("../../models/episodeModel");

exports.createEpisodeValidator = [
  validateExactFields(
    ["title", "episodeNumber", "playlistId", "seasonNumber"],
    [],
    []
  ),
  check("title")
    .notEmpty()
    .withMessage("The episode title is required")
    .isLength({ min: 3 })
    .withMessage("The episode title too short, min 3 chars")
    .isLength({ max: 70 })
    .withMessage("The episode title too long, max 70 chars"),
  check("episodeNumber")
    .notEmpty()
    .withMessage("Episode number is required")
    .isInt({ min: 1 })
    .withMessage("Episode number must be a positive integer"),
  check("playlistId")
    .notEmpty()
    .withMessage("The episode playlist Id is required")
    .isMongoId()
    .withMessage("Invalid playlist ID format")
    .custom(async (value) => {
      const playlist = await Playlist.findById(value);
      if (!playlist) {
        throw new Error(`Not found playlist with this id: ${value || ""}`);
      }
      return true;
    }),
  check("seasonNumber")
    .notEmpty()
    .withMessage("Season number is required")
    .isInt({ min: 1 })
    .withMessage("Season number must be a positive integer"),

  validatorMiddleware,
];

exports.getEpisodesValidator = [
  validateExactFields(
    [],
    [],
    ["page", "limit", "keyword", "sort", "fields", "sort", "keyword", "_id"]
  ),
  validatorMiddleware,
];

exports.getEpisodeValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid episode ID format"),
  validatorMiddleware,
];

exports.updateEpisodeValidator = [
  validateExactFields(
    ["title", "episodeNumber", "playlistId", "seasonNumber"],
    ["id"],
    []
  ),
  check("id")
    .notEmpty()
    .withMessage("The episode id is required")
    .isMongoId()
    .withMessage("Invalid episode ID format")
    .custom(async (value) => {
      const episode = await Episode.findById(value);
      console.log(episode)
      if (!episode) {
        throw new Error(`Not found episode with this id: ${value}`);
      }
      return true;
    }),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("The episode title too short, min 3 chars")
    .isLength({ max: 70 })
    .withMessage("The episode title too long, max 70 chars"),
  check("episodeNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Episode number must be a positive integer"),
  check("playlistId")
    .optional()
    .isMongoId()
    .withMessage("Invalid playlist ID format")
    .custom(async (value) => {
      const playlist = await Playlist.findById(value);
      if (!playlist) {
        throw new Error(`Not found playlist with this id: ${value}`);
      }
      return true;
    }),
  check("seasonNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Season number must be a positive integer"),

  validatorMiddleware,
];

exports.deleteEpisodeValidator = [
  validateExactFields([], ["id"], []),
  check("id")
    .notEmpty()
    .withMessage("The episode id is required")
    .isMongoId()
    .withMessage("Invalid episode ID format")
    .custom(async (value) => {
      const playlist = await Episode.findById(value);
      if (!playlist) {
        throw new Error(`Not found episode with this id: ${value}`);
      }
      return true;
    }),
  validatorMiddleware,
];
