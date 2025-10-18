const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Plan = require("../models/planModel");

exports.parseJSON = asyncHandler(async (req, res, next) => {
  let features = req.body.features;

  // Step 2: Parse features if needed
  if (features != null && features !== "" && !Array.isArray(req.body.features)) {
    try {
      // Convert JSON string to array/object
      req.body.features = JSON.parse(req.body.features);
    } catch (error) {
      // Bad format -> return 400
      return next(new ApiError("Invalid features format.", 400));
    }
  }

  // Step 3: Continue
  next();
});

// @desc    Get list of plans
// @route    GET /api/v1/plans
// @access    public
exports.getPlans = factory.getAll(Plan, "Plans");

// @desc    Get specific plan by id
// @route    GET /api/v1/plans/:id
// @access    public
exports.getPlan = factory.getOne(Plan);

// @desc    Update specific plan by id
// @route    PUT /api/v1/plans/:id
// @access    Private
exports.updatePlan = factory.updateOne(Plan);
