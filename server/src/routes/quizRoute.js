const express = require("express");

const {
  getRandomQuizzesValidator,
  getQuizzesValidator,
  getQuizValidator,
  deleteQuizValidator,
  updateQuizValidator,
} = require("../utils/validators/quizValidator");
const {
  getRandomQuizzes,
  getQuizzes,
  getQuiz,
  deleteQuiz,
  updateQuiz,
  resizeImage,
  uploadQuizImage,
} = require("../controllers/quizController");

const router = express.Router();

router.post("/random", getRandomQuizzesValidator, getRandomQuizzes);

router.get("/", getQuizzesValidator, getQuizzes);

router
  .route("/:id")
  .put(uploadQuizImage, updateQuizValidator, resizeImage, updateQuiz)
  .get(getQuizValidator, getQuiz)
  .delete(deleteQuizValidator, deleteQuiz);

module.exports = router;
