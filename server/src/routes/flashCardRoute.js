const express = require("express");
const {
  getFlashCards,
  getFlashCard,
  getRandomFlashCards,
  deleteFlashCard,
  updateFlashCard,
  resizeImage,
  uploadFlashCardImage,
} = require("../controllers/flashCardController");
const {
  getFlashCardsValidator,
  getFlashCardValidator,
  getRandomFlashCardsValidator,
  deleteFlashCardValidator,
  updateFlashCardValidator,
} = require("../utils/validators/flashCardValidator");

const router = express.Router();

router.post("/random", getRandomFlashCardsValidator, getRandomFlashCards);

router.get("/", getFlashCardsValidator, getFlashCards);

router
  .route("/:id")
  .put(
    uploadFlashCardImage,
    updateFlashCardValidator,
    resizeImage,
    updateFlashCard
  )
  .get(getFlashCardValidator, getFlashCard)
  .delete(deleteFlashCardValidator, deleteFlashCard);

module.exports = router;
