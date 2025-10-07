const express = require("express");

const router = express.Router();

const {
  getPlans,
  getPlan,
  updatePlan,
} = require("../controllers/planController");
const {
  getPlansValidator,
  getPlanValidator,
  updatePlanValidator,
} = require("../utils/validators/planValidator");

const AuthService = require("../controllers/authController");

router.use(AuthService.protect);

router.get(
  "/",
  AuthService.allowedTo("user", "admin", "employee"),
  getPlansValidator,
  getPlans
);
router
  .route("/:id")
  .get(
    AuthService.allowedTo("user", "admin", "employee"),
    getPlanValidator,
    getPlan
  )
  .put(AuthService.allowedTo("admin"), updatePlanValidator, updatePlan);

module.exports = router;
