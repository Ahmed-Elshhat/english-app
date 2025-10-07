const express = require("express");

const router = express.Router();

// Import controller functions for handling plan-related logic
const {
  getPlans,
  getPlan,
  updatePlan,
} = require("../controllers/planController");

// Import validation middlewares to validate requests for each route
const {
  getPlansValidator,
  getPlanValidator,
  updatePlanValidator,
} = require("../utils/validators/planValidator");

// Import authentication and authorization middlewares
const AuthService = require("../controllers/authController");

// GET /plans → Retrieve all available plans (with validation)
router.get("/", getPlansValidator, getPlans);

// Routes for a specific plan by ID
router
  .route("/:id")
  // GET /plans/:id → Get a specific plan using its ID (with validation)
  .get(getPlanValidator, getPlan)
  // PUT /plans/:id → Update a specific plan (admin only)
  // AuthService.protect → Ensure the user is authenticated
  // AuthService.allowedTo("admin") → Allow only admin users to update plans
  // updatePlanValidator → Validate the input data before updating
  // updatePlan → Perform the update logic
  .put(
    AuthService.protect,
    AuthService.allowedTo("admin"),
    updatePlanValidator,
    updatePlan
  );

// Export the router so it can be used in the main app
module.exports = router;
