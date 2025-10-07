const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Employee = require("../models/employeeModel");

// @desc    Get list of employees
// @route    GET /api/v1/employees
// @access    Private
exports.getEmployees = factory.getAll(Employee, "Employees");

// @desc    Get specific employee by id
// @route    GET /api/v1/employees/:id
// @access    Private
exports.getEmployee = factory.getOne(Employee);

// transform time format to number
function getHour(time) {
  const match = time.match(/^0?(\d+):([0-5]\d)$/);
  if (!match) return { hour: null, minutes: null };

  const hour = parseInt(match[1], 10);
  let minutes = parseInt(match[2], 10);

  if (minutes === 0) minutes = 0;

  return { hour, minutes };
}

// Middleware because transform time format to number for StartShift and EndShift
exports.createUserValidatorMiddleware = (req, res, next) => {
  let errors = {};

  let startShift = null;
  let endShift = null;

  const isPut = req.method === "PUT";

  if (req.body.startShift != null) startShift = getHour(req.body.startShift);
  if (req.body.endShift != null) endShift = getHour(req.body.endShift);

  if (!isPut) {
    if (req.body.startShift == null)
      errors.startShift = "Start shift is required.";
    if (req.body.endShift == null) errors.endShift = "End shift is required.";
  }

  if (req.body.startShift != null) {
    if (!startShift?.hour || startShift?.hour > 24) {
      errors.startShift =
        "Invalid start shift time must be between 1 and 24 example(01:00 Or 24:00)";
    }
  }

  if (req.body.endShift != null) {
    if (!endShift?.hour || endShift?.hour > 24) {
      errors.endShift =
        "Invalid end shift time must be between 1 and 24 example(01:00 Or 24:00)";
    }
  }

  const allDefined =
    startShift?.hour != null &&
    startShift?.minutes != null &&
    endShift?.hour != null &&
    endShift?.minutes != null;

  if (allDefined) {
    if (
      startShift.hour === endShift.hour &&
      startShift.minutes === endShift.minutes
    ) {
      errors.shiftMatch = "Start shift and end shift cannot be the same.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(new ApiError("Shift Errors", 400, errors));
  }

  if (req.body.startShift != null) req.body.startShift = startShift;
  if (req.body.endShift != null) req.body.endShift = endShift;
  next();
};

// @desc    Create employee
// @route    POST /api/v1/employees
// @access    Private
exports.createEmployee = factory.createOne(Employee, "Employees");

// @desc    Update specific employee
// @route    PUT /api/v1/employees/:id
// @access    Private
exports.updateEmployee = factory.updateOne(Employee);

// @desc    Delete specific employee
// @route    PUT /api/v1/employees/:id
// @access    Private
exports.deleteEmployee = factory.deleteOne(Employee);
