const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");
const Playlist = require("../../models/playlistModel");

exports.createEpisodeValidator = [
  validateExactFields(
    ["title", "episodeNumber", "playlistsId", "seasonNumber"],
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
  check("playlistsId")
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
    [
      "page",
      "limit",
      "keyword",
      "sort",
      "fields",
      "sort",
      "keyword",
      "_id",
    ]
  ),
  validatorMiddleware,
];

exports.getEpisodeValidator = [
  validateExactFields([], ["id"], []),

  validatorMiddleware,
];
