const express = require("express");

const router = express.Router();
// Create a new Express router instance to define user-related routes.

// Import all user validation middlewares to ensure request data is valid
//     before it reaches the controller logic.
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  getUsersValidator,
  sendChangeEmailVerifyCodeValidator,
  verifyChangeEmailCodeValidator,
} = require("../utils/validators/userValidator");

// Import controller functions that handle the main business logic
//     for user management and authentication-related operations.
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getOneWithToken,
  sendChangeEmailVerifyCode,
  verifyChangeEmailCode,
} = require("../controllers/userController");

// Import authentication service to protect routes
//     and restrict access based on user roles.
const AuthService = require("../controllers/authController");

// Protect all routes below — only authenticated users can access them.
router.use(AuthService.protect);

// Route: PUT /sendChangeEmailVerifyCode
//     ➤ Sends a verification code to the user's new email address.
//     ➤ Validated using sendChangeEmailVerifyCodeValidator.
router.put(
  "/sendChangeEmailVerifyCode",
  sendChangeEmailVerifyCodeValidator,
  sendChangeEmailVerifyCode
);

// Route: PUT /verifyChangeEmailCode
//     ➤ Verifies the email change code entered by the user.
//     ➤ Validated using verifyChangeEmailCodeValidator.
router.put(
  "/verifyChangeEmailCode",
  verifyChangeEmailCodeValidator,
  verifyChangeEmailCode
);

// Route: PUT /changePassword
//     ➤ Allows a logged-in user to change their password securely.
//     ➤ Validated using changeUserPasswordValidator.
router.put("/changePassword", changeUserPasswordValidator, changeUserPassword);

// Route: GET /getOne
//     ➤ Returns the currently logged-in user's data using the JWT token.
router.get("/getOne", getOneWithToken);

// Route group: "/" → For listing and creating users (admin only)
router
  .route("")
  // GET /users → List all users (requires admin role)
  .get(AuthService.allowedTo("admin"), getUsersValidator, getUsers)
  // POST /users → Create a new user (requires admin role)
  .post(AuthService.allowedTo("admin"), createUserValidator, createUser);

// Route group: "/:id" → For managing a specific user by ID
router
  .route("/:id")
  // GET /users/:id → Get user details (admin only)
  .get(AuthService.allowedTo("admin"), getUserValidator, getUser)
  // PUT /users/:id → Update user details (accessible to logged-in user or admin)
  .put(updateUserValidator, updateUser)
  // DELETE /users/:id → Delete a user (admin only)
  .delete(AuthService.allowedTo("admin"), deleteUserValidator, deleteUser);

// Export the router to be used in the main application
module.exports = router;
