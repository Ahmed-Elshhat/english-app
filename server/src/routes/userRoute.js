const express = require("express");

const router = express.Router();
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

const AuthService = require("../controllers/authController");

router.use(AuthService.protect);

router.put(
  "/sendChangeEmailVerifyCode",
  sendChangeEmailVerifyCodeValidator,
  sendChangeEmailVerifyCode
);// Done

router.put(
  "/verifyChangeEmailCode",
  verifyChangeEmailCodeValidator,
  verifyChangeEmailCode
); // Done

router.put("/changePassword", changeUserPasswordValidator, changeUserPassword); // Done

router.get("/getOne", getOneWithToken); // Done

router
  .route("")
  .get(AuthService.allowedTo("admin"), getUsersValidator, getUsers) // Done
  .post(AuthService.allowedTo("admin"), createUserValidator, createUser); // Done

router
  .route("/:id")
  .get(AuthService.allowedTo("admin"), getUserValidator, getUser) // Done
  .put(updateUserValidator, updateUser) // Done
  .delete(AuthService.allowedTo("admin"), deleteUserValidator, deleteUser); // Done

module.exports = router;
