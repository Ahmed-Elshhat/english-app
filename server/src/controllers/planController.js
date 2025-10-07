const Plan = require("../models/planModel");
const factory = require("./handlersFactory");

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
