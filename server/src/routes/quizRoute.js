const express = require("express");

const {
  getRandomQuizzesValidator,
  getQuizzesValidator,
  getQuizValidator,
  deleteQuizValidator,
  updateQuizValidator,
} = require("../utils/validators/quizValidator");
// Import validation middlewares for different quiz operations
//     (ensures requests are valid before reaching the controller).

const {
  getRandomQuizzes,
  getQuizzes,
  getQuiz,
  deleteQuiz,
  updateQuiz,
  resizeImage,
  uploadQuizImage,
} = require("../controllers/quizController");
// Import controller functions that contain the main logic
//     for handling quiz data and image uploads.

const router = express.Router();
// Create a new Express router instance to define quiz-related routes.

// Import authentication and authorization middleware
//     to protect routes and restrict them by user roles.
const AuthService = require("../controllers/authController");

// Apply authentication middleware globally to all routes in this file.
//     ➤ Only logged-in users will be able to access any of the quiz routes.
router.use(AuthService.protect);

// Route for getting random quizzes (available to all authenticated users)
//     - Validator checks request structure
//     - Controller returns randomly selected quizzes
router.post("/random", getRandomQuizzesValidator, getRandomQuizzes);

// Route for fetching all quizzes (restricted to admin and employee roles)
//     - Validator ensures query parameters are valid
//     - Controller retrieves quizzes from the database
router.get(
  "/",
  AuthService.allowedTo("admin", "employee"),
  getQuizzesValidator,
  getQuizzes
);

// Routes for specific quiz operations using the quiz ID
router
  .route("/:id")
  // Update quiz by ID (only admin or employee can update)
  //       - Upload and resize image if included
  //       - Validate input before updating database record
  .put(
    AuthService.allowedTo("admin", "employee"),
    uploadQuizImage,
    updateQuizValidator,
    resizeImage,
    updateQuiz
  )
  // Get a single quiz by ID (for viewing details)
  .get(getQuizValidator, getQuiz)
  // Delete a quiz by ID (restricted to admin and employee roles)
  //       - Validate ID before deletion
  .delete(
    AuthService.allowedTo("admin", "employee"),
    deleteQuizValidator,
    deleteQuiz
  );

// Export the router so it can be used in the main Express app
module.exports = router;
