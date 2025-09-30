const { check, body } = require("express-validator");
const mongoose = require("mongoose");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const { validateExactFields } = require("../validateFields");
const Playlist = require("../../models/playlistModel");
const Episode = require("../../models/episodeModel");

exports.createVideoValidator = [
  validateExactFields(
    [
      "title",
      "description",
      "videoImage",
      "video",
      "playlistId",
      "seasonNumber",
      "episodeId",
      "videoNumber",
      "flashCards",
      "quizzes",
      "flashCardsImages",
      "quizzesImages",
      "subtitleEn",
      "subtitleAr",
    ],
    [],
    []
  ),

  check("title")
    .notEmpty()
    .withMessage("The video title is required")
    .isString()
    .withMessage("The video title must be a string")
    .isLength({ min: 3 })
    .withMessage("The video title too short, min 3 chars")
    .isLength({ max: 70 })
    .withMessage("The video title too long, max 70 chars"),
  check("description")
    .notEmpty()
    .withMessage("The video description is required")
    .isString()
    .withMessage("The video description must be a string")
    .isLength({ min: 3 })
    .withMessage("The video description too short, min 3 chars")
    .isLength({ max: 100 })
    .withMessage("The video description too long, max 100 chars"),
  check("videoImage").custom((value, { req }) => {
    if (
      !req.files ||
      !req.files.videoImage ||
      req.files.videoImage.length === 0
    ) {
      throw new Error("The video image is required");
    }
    return true;
  }),
  check("video").custom((value, { req }) => {
    if (!req.files || !req.files.video || req.files.video.length === 0) {
      throw new Error("The video is required");
    }
    return true;
  }),
  check("subtitleEn").custom((value, { req }) => {
    if (
      !req.files ||
      !req.files.subtitleEn ||
      req.files.subtitleEn.length === 0
    ) {
      throw new Error("The video english subtitle is required");
    }
    return true;
  }),
  check("subtitleAr").custom((value, { req }) => {
    if (
      !req.files ||
      !req.files.subtitleAr ||
      req.files.subtitleAr.length === 0
    ) {
      throw new Error("The video arabic subtitle is required");
    }
    return true;
  }),

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
  check("episodeId")
    .optional()
    .isMongoId()
    .withMessage("Invalid playlist ID format")
    .custom(async (value, { req }) => {
      if (req.body.playlistId) {
        const playlist = await Playlist.findById(req.body.playlistId);
        if (playlist) {
          if (playlist.type === "movie") {
            throw new Error(
              "You cannot add an episode to a playlist of type 'movie'"
            );
          }
        }
      }
      const episode = await Episode.findById(value);
      if (!episode) {
        throw new Error(`Not found episode with this id: ${value || ""}`);
      }
      return true;
    }),
  check("videoNumber")
    .notEmpty()
    .withMessage("video number is required")
    .isInt({ min: 1 })
    .withMessage("video number must be a positive integer"),
  body("flashCards")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Flash cards must be a non-empty array"),

  body("flashCards.*.title")
    .notEmpty()
    .withMessage("Flash card title is required")
    .isString()
    .withMessage("Flash card title must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Flash card title must be between 3 and 70 characters"),

  body("flashCards.*.description")
    .notEmpty()
    .withMessage("Flash card description is required")
    .isString()
    .withMessage("Flash card description must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Flash card description must be between 3 and 70 characters"),

  body("flashCards.*.flashCardNumber")
    .notEmpty()
    .withMessage("Flash card number is required")
    .isNumeric()
    .withMessage("Flash card number must be a number"),

  body("flashCards.*.image")
    .notEmpty()
    .withMessage("Flash card image is required")
    .isString()
    .withMessage("Flash card image must be a string"),

  body("flashCards.*.word")
    .notEmpty()
    .withMessage("Flash card word is required")
    .isString()
    .withMessage("Flash card word must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Flash card word must be between 2 and 20 characters"),

  body("flashCards.*.wordType")
    .notEmpty()
    .withMessage("Flash card word type is required")
    .isString()
    .withMessage("Flash card word type must be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("Flash card word type must be between 2 and 40 characters"),

  body("flashCards.*.example")
    .notEmpty()
    .withMessage("Flash card example is required")
    .isString()
    .withMessage("Flash card example must be a string")
    .isLength({ min: 5, max: 200 })
    .withMessage("Flash card example must be between 5 and 200 characters"),

  body("flashCards.*.explain")
    .notEmpty()
    .withMessage("Flash card explain is required")
    .isString()
    .withMessage("Flash card explain must be a string")
    .isLength({ min: 5, max: 200 })
    .withMessage("Flash card explain must be between 5 and 200 characters"),

  body("quizzes")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Quizzes must be a non-empty array"),

  body("quizzes.*.title")
    .notEmpty()
    .withMessage("Quiz title is required")
    .isString()
    .withMessage("Quiz title must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Quiz title must be between 3 and 70 characters"),

  body("quizzes.*.quizNumber")
    .notEmpty()
    .withMessage("Quiz number is required")
    .isNumeric()
    .withMessage("Quiz number must be a number"),

  body("quizzes.*.image")
    .notEmpty()
    .withMessage("Quiz image is required")
    .isString()
    .withMessage("Quiz image must be a string"),

  // ✅ Questions validation
  body("quizzes.*.questions")
    .isArray({ min: 1 })
    .withMessage("Each quiz must have at least one question"),

  body("quizzes.*.questions.*.questionEn")
    .notEmpty()
    .withMessage("English question text is required")
    .isString()
    .withMessage("English question must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("English question must be between 3 and 70 characters"),

  body("quizzes.*.questions.*.questionAr")
    .notEmpty()
    .withMessage("Arabic question text is required")
    .isString()
    .withMessage("Arabic question must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Arabic question must be between 3 and 70 characters"),

  body("quizzes.*.questions.*.word")
    .notEmpty()
    .withMessage("Question word is required")
    .isString()
    .withMessage("Question word must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Question word must be between 2 and 20 characters"),

  body("quizzes.*.questions.*.rightAnswer")
    .notEmpty()
    .withMessage("Right answer is required")
    .isString()
    .withMessage("Right answer must be a string")
    .isLength({ min: 1, max: 1 })
    .withMessage("Right answer must be exactly 1 character"),

  // ✅ Answers validation
  body("quizzes.*.questions.*.answers")
    .isArray({ min: 1 })
    .withMessage("Each question must have at least one answer"),

  body("quizzes.*.questions.*.answers.*.answerEn")
    .notEmpty()
    .withMessage("English answer is required")
    .isString()
    .withMessage("English answer must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("English answer be between 3 and 100 characters"),

  body("quizzes.*.questions.*.answers.*.answerAr")
    .notEmpty()
    .withMessage("Arabic answer is required")
    .isString()
    .withMessage("Arabic answer must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Arabic answer must be between 3 and 100 characters"),

  body("quizzes.*.questions.*.answers.*.character")
    .notEmpty()
    .withMessage("Answer character is required")
    .isString()
    .isLength({ min: 1, max: 1 })
    .withMessage("Answer character must be exactly 1 character"),
  validatorMiddleware,
];

exports.getVideosValidator = [
  validateExactFields(
    [],
    [],
    ["page", "limit", "keyword", "sort", "fields", "keyword", "_id"]
  ),
  check("sort")
    .optional()
    .isIn(["-createdAt", "createdAt"])
    .withMessage("The video sort must be either '-createdAt' or 'createdAt'"),
  check("_id")
    .optional()
    .isMongoId()
    .withMessage("The provided ID must be a valid ID"),
  validatorMiddleware,
];

exports.getVideoValidator = [
  validateExactFields([], ["id"], []),
  check("id").isMongoId().withMessage("Invalid video ID format"),
  validatorMiddleware,
];

exports.getRandomVideosValidator = [
  validateExactFields(["excludeIds"], [], ["videosSize"]),

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

  // videosSize validation
  check("videosSize")
    .optional()
    .custom((value) => {
      if (typeof value === "number") return true;

      if (typeof value === "string" && /^\d+$/.test(value)) return true;

      throw new Error(
        "videosSize must be a number or a numeric string without spaces or letters"
      );
    }),
  validatorMiddleware,
];

exports.updateVideoValidator = [
  validateExactFields(
    [
      "title",
      "description",
      "videoImage",
      "video",
      "playlistId",
      "seasonNumber",
      "episodeId",
      "videoNumber",
      "flashCards",
      "quizzes",
      "flashCardsImages",
      "quizzesImages",
      "subtitleEn",
      "subtitleAr",
    ],
    [],
    []
  ),

  check("title")
    .optional()
    .isString()
    .withMessage("The video title must be a string")
    .isLength({ min: 3 })
    .withMessage("The video title too short, min 3 chars")
    .isLength({ max: 70 })
    .withMessage("The video title too long, max 70 chars"),
  check("description")
    .optional()
    .isString()
    .withMessage("The video description must be a string")
    .isLength({ min: 3 })
    .withMessage("The video description too short, min 3 chars")
    .isLength({ max: 100 })
    .withMessage("The video description too long, max 100 chars"),
  check("playlistId")
    .optional()
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
    .optional()
    .isInt({ min: 1 })
    .withMessage("Season number must be a positive integer"),
  check("episodeId")
    .optional()
    .isMongoId()
    .withMessage("Invalid playlist ID format")
    .custom(async (value, { req }) => {
      if (req.body.playlistId) {
        const playlist = await Playlist.findById(req.body.playlistId);
        if (playlist) {
          if (playlist.type === "movie") {
            throw new Error(
              "You cannot add an episode to a playlist of type 'movie'"
            );
          }
        }
      }
      const episode = await Episode.findById(value);
      if (!episode) {
        throw new Error(`Not found episode with this id: ${value || ""}`);
      }
      return true;
    }),
  check("videoNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("video number must be a positive integer"),
  body("flashCards")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Flash cards must be a non-empty array"),

  body("flashCards.*.title")
    .notEmpty()
    .withMessage("Flash card title is required")
    .isString()
    .withMessage("Flash card title must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Flash card title must be between 3 and 70 characters"),

  body("flashCards.*.description")
    .notEmpty()
    .withMessage("Flash card description is required")
    .isString()
    .withMessage("Flash card description must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Flash card description must be between 3 and 70 characters"),

  body("flashCards.*.flashCardNumber")
    .notEmpty()
    .withMessage("Flash card number is required")
    .isNumeric()
    .withMessage("Flash card number must be a number"),

  body("flashCards.*.image")
    .notEmpty()
    .withMessage("Flash card image is required")
    .isString()
    .withMessage("Flash card image must be a string"),

  body("flashCards.*.word")
    .notEmpty()
    .withMessage("Flash card word is required")
    .isString()
    .withMessage("Flash card word must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Flash card word must be between 2 and 20 characters"),

  body("flashCards.*.wordType")
    .notEmpty()
    .withMessage("Flash card word type is required")
    .isString()
    .withMessage("Flash card word type must be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("Flash card word type must be between 2 and 40 characters"),

  body("flashCards.*.example")
    .notEmpty()
    .withMessage("Flash card example is required")
    .isString()
    .withMessage("Flash card example must be a string")
    .isLength({ min: 5, max: 200 })
    .withMessage("Flash card example must be between 5 and 200 characters"),

  body("flashCards.*.explain")
    .notEmpty()
    .withMessage("Flash card explain is required")
    .isString()
    .withMessage("Flash card explain must be a string")
    .isLength({ min: 5, max: 200 })
    .withMessage("Flash card explain must be between 5 and 200 characters"),

  body("quizzes")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Quizzes must be a non-empty array"),

  body("quizzes.*.title")
    .notEmpty()
    .withMessage("Quiz title is required")
    .isString()
    .withMessage("Quiz title must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Quiz title must be between 3 and 70 characters"),

  body("quizzes.*.quizNumber")
    .notEmpty()
    .withMessage("Quiz number is required")
    .isNumeric()
    .withMessage("Quiz number must be a number"),

  body("quizzes.*.image")
    .notEmpty()
    .withMessage("Quiz image is required")
    .isString()
    .withMessage("Quiz image must be a string"),

  // ✅ Questions validation
  body("quizzes.*.questions")
    .isArray({ min: 1 })
    .withMessage("Each quiz must have at least one question"),

  body("quizzes.*.questions.*.questionEn")
    .notEmpty()
    .withMessage("English question text is required")
    .isString()
    .withMessage("English question must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("English question must be between 3 and 70 characters"),

  body("quizzes.*.questions.*.questionAr")
    .notEmpty()
    .withMessage("Arabic question text is required")
    .isString()
    .withMessage("Arabic question must be a string")
    .isLength({ min: 3, max: 70 })
    .withMessage("Arabic question must be between 3 and 70 characters"),

  body("quizzes.*.questions.*.word")
    .notEmpty()
    .withMessage("Question word is required")
    .isString()
    .withMessage("Question word must be a string")
    .isLength({ min: 2, max: 20 })
    .withMessage("Question word must be between 2 and 20 characters"),

  body("quizzes.*.questions.*.rightAnswer")
    .notEmpty()
    .withMessage("Right answer is required")
    .isString()
    .withMessage("Right answer must be a string")
    .isLength({ min: 1, max: 1 })
    .withMessage("Right answer must be exactly 1 character"),

  // ✅ Answers validation
  body("quizzes.*.questions.*.answers")
    .isArray({ min: 1 })
    .withMessage("Each question must have at least one answer"),

  body("quizzes.*.questions.*.answers.*.answerEn")
    .notEmpty()
    .withMessage("English answer is required")
    .isString()
    .withMessage("English answer must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("English answer be between 3 and 100 characters"),

  body("quizzes.*.questions.*.answers.*.answerAr")
    .notEmpty()
    .withMessage("Arabic answer is required")
    .isString()
    .withMessage("Arabic answer must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Arabic answer must be between 3 and 100 characters"),

  body("quizzes.*.questions.*.answers.*.character")
    .notEmpty()
    .withMessage("Answer character is required")
    .isString()
    .isLength({ min: 1, max: 1 })
    .withMessage("Answer character must be exactly 1 character"),
  validatorMiddleware,
];
