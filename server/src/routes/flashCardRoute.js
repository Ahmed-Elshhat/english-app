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

// Import authentication middleware to protect routes and restrict access by roles
const AuthService = require("../controllers/authController");

// Apply authentication protection to all flash card routes (only logged-in users can access)
router.use(AuthService.protect);

// Route to get random flash cards (used for quizzes or random practice sessions)
router.post("/random", getRandomFlashCardsValidator, getRandomFlashCards);

// Route to get all flash cards (accessible only by admin or employee)
router.get(
  "/",
  AuthService.allowedTo("admin", "employee"), // Only admin and employee roles can access
  getFlashCardsValidator, // Validate query parameters (e.g., pagination or filters)
  getFlashCards // Controller: fetch all flash cards from DB
);

// Routes for a single flash card by its ID
router
  .route("/:id")
  // Get one flash card (public route – any logged-in user)
  .get(getFlashCardValidator, getFlashCard)

  // Update flash card (admin and employee only)
  .put(
    AuthService.allowedTo("admin", "employee"), // Role-based restriction
    uploadFlashCardImage, // Middleware to handle image upload
    updateFlashCardValidator, // Validate body fields (title, videoId, etc.)
    resizeImage, // Resize uploaded image before saving
    updateFlashCard // Controller: update the flash card in DB
  )

  // Delete flash card (admin and employee only)
  .delete(
    AuthService.allowedTo("admin", "employee"), // Only admin or employee can delete
    deleteFlashCardValidator, // Validate ID before deleting
    deleteFlashCard // Controller: delete flash card from DB and remove image file if exists
  );

// Export router to be used in the main Express app
module.exports = router;
