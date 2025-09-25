const mongoose = require("mongoose");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");

exports.createPlaylistValidator = [
  validateExactFields(
    ["type", "title", "description", "image", "seasons"],
    [],
    []
  ),
  check("type")
    .notEmpty()
    .withMessage("The playlist type is required")
    .isString()
    .withMessage("The playlist type must be a string")
    .isIn(["movie", "series"])
    .withMessage("The playlist type must be either 'movie' or 'series'"),
  check("title")
    .notEmpty()
    .withMessage("The playlist title is required")
    .isString()
    .withMessage("The playlist title must be a string")
    .isLength({ min: 3 })
    .withMessage("The playlist title too short, min 3 chars")
    .isLength({ max: 70 })
    .withMessage("The playlist title too long, max 70 chars"),
  check("description")
    .notEmpty()
    .withMessage("The playlist description is required")
    .isString()
    .withMessage("The playlist description must be a string")
    .isLength({ min: 3 })
    .withMessage("The playlist description too short, min 3 chars")
    .isLength({ max: 100 })
    .withMessage("The playlist description too long, max 100 chars"),
  check("image")
    .notEmpty()
    .withMessage("The playlist image is required")
    .isString()
    .withMessage("The playlist image must be a string"),
  check("seasons")
    .notEmpty()
    .withMessage("The playlist seasons is required")
    .isArray()
    .withMessage("The playlist seasons must be an array")
    .custom((seasons) => {
      const numbers = seasons.map((s) => s.seasonNumber);
      const duplicates = numbers.filter(
        (num, index) => numbers.indexOf(num) !== index
      );
      if (duplicates.length > 0) {
        throw new Error(
          `Duplicate seasonNumber found: ${duplicates.join(", ")}`
        );
      }
      return true;
    }),

  check("seasons.*.seasonNumber")
    .notEmpty()
    .withMessage((value, { path }) => {
      const index = path.match(/\d+/)[0];
      return `The season number is required at item ${index + 1}`;
    })
    .isInt({ min: 1 })
    .withMessage((value, { path }) => {
      const index = parseInt(path.match(/\d+/)[0], 10);
      return `The season number must be a positive integer at item ${index + 1}`;
    }),

  check("seasons.*.countOfEpisodes")
    .optional()
    .isInt()
    .withMessage((value, { path }) => {
      const index = parseInt(path.match(/\d+/)[0], 10);
      return `The count of episodes must be a number at item ${index + 1}`;
    }),

  validatorMiddleware,
];

exports.getPlaylistsValidator = [
  validateExactFields(
    [],
    [],
    [
      "page",
      "limit",
      "keyword",
      "sort",
      "fields",
      "type",
      "sort",
      "keyword",
      "_id",
    ]
  ),
  check("type")
    .optional()
    .isIn(["movie", "series"])
    .withMessage("The playlist type must be either 'movie' or 'series'"),
  check("sort")
    .optional()
    .isIn(["-createdAt", "createdAt"])
    .withMessage(
      "The playlist sort must be either '-createdAt' or 'createdAt'"
    ),
  check("_id")
    .optional()
    .isMongoId()
    .withMessage("The provided ID must be a valid ID"),
  validatorMiddleware,
];

exports.getPlaylistValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid playlist ID format"),
  validatorMiddleware,
];

exports.getRandomPlaylistsValidator = [
  validateExactFields(["excludeIds"], [], ["playlistsType", "playlistsSize"]),

  // excludeIds validation
  check("excludeIds")
    .optional()
    .isArray()
    .withMessage("excludeIds must be an array")
    .bail()
    .custom((arr) => {
      const allValid = arr.every(
        (id) => typeof id === "string" && mongoose.isValidObjectId(id)
      );

      if (!allValid) {
        throw new Error(
          "All excludeIds must be valid MongoDB ObjectId strings"
        );
      }

      return true;
    }),

  // playlistsType validation
  check("playlistsType")
    .exists({ checkFalsy: true })
    .withMessage("playlistsType is required")
    .isString()
    .withMessage("playlistsType must be a string")
    .isIn(["series", "movie"])
    .withMessage("playlistsType must be either 'series' or 'movie'"),

  // playlistsSize validation
  check("playlistsSize")
    .optional()
    .custom((value) => {
      if (typeof value === "number") return true;

      if (typeof value === "string" && /^\d+$/.test(value)) return true;

      throw new Error(
        "playlistsSize must be a number or a numeric string without spaces or letters"
      );
    }),
  validatorMiddleware,
];

exports.updatePlaylistValidator = [
  validateExactFields(
    ["type", "title", "description", "image", "seasons"],
    ["id"],
    []
  ),
  check("id")
    .notEmpty()
    .withMessage("The playlist id is required")
    .isMongoId()
    .withMessage("Invalid playlist ID format"),
  check("type")
    .optional()
    .isString()
    .withMessage("The playlist type must be a string")
    .isIn(["movie", "series"])
    .withMessage("The playlist type must be either 'movie' or 'series'"),
  check("title")
    .optional()
    .isString()
    .withMessage("The playlist title must be a string")
    .isLength({ min: 3 })
    .withMessage("The playlist title too short, min 3 chars")
    .isLength({ max: 70 })
    .withMessage("The playlist title too long, max 70 chars"),
  check("description")
    .optional()
    .isString()
    .withMessage("The playlist description must be a string")
    .isLength({ min: 3 })
    .withMessage("The playlist description too short, min 3 chars")
    .isLength({ max: 100 })
    .withMessage("The playlist description too long, max 100 chars"),
  check("image")
    .optional()
    .isString()
    .withMessage("The playlist image must be a string"),
  check("seasons")
    .optional()
    .isArray()
    .withMessage("The playlist seasons must be an array")
    .custom((seasons) => {
      const numbers = seasons.map((s) => s.seasonNumber);
      const duplicates = numbers.filter(
        (num, index) => numbers.indexOf(num) !== index
      );
      if (duplicates.length > 0) {
        throw new Error(
          `Duplicate seasonNumber found: ${duplicates.join(", ")}`
        );
      }
      return true;
    }),

  check("seasons.*.seasonNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage((value, { path }) => {
      const index = parseInt(path.match(/\d+/)[0], 10);
      return `The season number must be a positive integer at item ${index + 1}`;
    }),

  check("seasons.*.countOfEpisodes")
    .optional()
    .isInt()
    .withMessage((value, { path }) => {
      const index = parseInt(path.match(/\d+/)[0], 10);
      return `The count of episodes must be a number at item ${index + 1}`;
    }),

  validatorMiddleware,
];

exports.deletePlaylistValidator = [
  validateExactFields([], ["id"], []),
  check("id")
    .notEmpty()
    .withMessage("The playlist id is required")
    .isMongoId()
    .withMessage("Invalid playlist ID format"),
  validatorMiddleware,
];
