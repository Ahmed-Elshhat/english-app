const express = require("express");
const {
  getFlashCards,
  getFlashCard,
  getRandomFlashCards,
  deleteFlashCard,
} = require("../controllers/flashCardController");
const {
  getFlashCardsValidator,
  getFlashCardValidator,
  getRandomFlashCardsValidator,
  deleteFlashCardValidator,
} = require("../utils/validators/flashCardValidator");

const router = express.Router();

router.post("/random", getRandomFlashCardsValidator, getRandomFlashCards);

router.get("/", getFlashCardsValidator, getFlashCards);

router
  .route("/:id")
  .get(getFlashCardValidator, getFlashCard)
  .delete(deleteFlashCardValidator, deleteFlashCard);

module.exports = router;
