const express = require("express");

const {
  getRandomQuizzesValidator,
  getQuizzesValidator,
  getQuizValidator,
  deleteQuizValidator,
} = require("../utils/validators/quizValidator");
const {
  getRandomQuizzes,
  getQuizzes,
  getQuiz,
  deleteQuiz,
} = require("../controllers/quizController");

const router = express.Router();

router.post("/random", getRandomQuizzesValidator, getRandomQuizzes);

router.get("/", getQuizzesValidator, getQuizzes);

router
  .route("/:id")
  .get(getQuizValidator, getQuiz)
  .delete(deleteQuizValidator, deleteQuiz);

module.exports = router;
