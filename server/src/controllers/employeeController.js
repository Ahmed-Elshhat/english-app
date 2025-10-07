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
  // Step 1: Try to match the input string with a valid time format (e.g., "9:30" or "09:45")
  //     - ^0?        → allows an optional leading zero before the hour
  //     - (\d+)      → captures one or more digits for the hour part
  //     - :          → matches the colon separator
  //     - ([0-5]\d)$ → captures two digits for minutes (00–59)
  const match = time.match(/^0?(\d+):([0-5]\d)$/);

  // Step 2: If the input doesn't match the pattern, return null values for hour and minutes
  if (!match) return { hour: null, minutes: null };

  // 3Step 3: Extract the captured hour and convert it from string to integer
  const hour = parseInt(match[1], 10);

  // Step 4: Extract the captured minutes and convert it from string to integer
  let minutes = parseInt(match[2], 10);

  // Step 5: Ensure minutes remain as 0 if the parsed value is exactly zero (for clarity)
  if (minutes === 0) minutes = 0;

  // Step 6: Return the final hour and minutes as an object
  return { hour, minutes };
}

// Middleware because transform time format to number for StartShift and EndShift
// @middleware shift validator
exports.createUserValidatorMiddleware = (req, res, next) => {
  // Step 1: Initialize an empty object to store validation errors
  let errors = {};

  // Step 2: Initialize variables for start and end shift times
  let startShift = null;
  let endShift = null;

  // Step 3: Check if the request method is PUT (used to allow partial updates)
  const isPut = req.method === "PUT";

  // Step 4: If startShift or endShift are provided in the request body, parse them using getHour()
  if (req.body.startShift != null) startShift = getHour(req.body.startShift);
  if (req.body.endShift != null) endShift = getHour(req.body.endShift);

  // Step 5: For non-PUT requests (like POST), ensure both start and end shift are required
  if (!isPut) {
    if (req.body.startShift == null)
      errors.startShift = "Start shift is required.";
    if (req.body.endShift == null) errors.endShift = "End shift is required.";
  }

  // Step 6: Validate the startShift value (must be between 1 and 24 hours)
  if (req.body.startShift != null) {
    if (!startShift?.hour || startShift?.hour > 24) {
      errors.startShift =
        "Invalid start shift time must be between 1 and 24 example(01:00 Or 24:00)";
    }
  }

  // Step 7: Validate the endShift value (must be between 1 and 24 hours)
  if (req.body.endShift != null) {
    if (!endShift?.hour || endShift?.hour > 24) {
      errors.endShift =
        "Invalid end shift time must be between 1 and 24 example(01:00 Or 24:00)";
    }
  }

  // Step 8: Check if all time components (hour & minutes) are defined for both shifts
  const allDefined =
    startShift?.hour != null &&
    startShift?.minutes != null &&
    endShift?.hour != null &&
    endShift?.minutes != null;

  // Step 9: If both times are defined, ensure they are not identical
  if (allDefined) {
    if (
      startShift.hour === endShift.hour &&
      startShift.minutes === endShift.minutes
    ) {
      errors.shiftMatch = "Start shift and end shift cannot be the same.";
    }
  }

  // Step 10: If there are any validation errors, pass them to the next middleware with an ApiError
  if (Object.keys(errors).length > 0) {
    return next(new ApiError("Shift Errors", 400, errors));
  }

  // Step 11: Replace original time strings with parsed time objects for further use in controllers
  if (req.body.startShift != null) req.body.startShift = startShift;
  if (req.body.endShift != null) req.body.endShift = endShift;

  // Step 12: Move to the next middleware or controller if no errors occurred
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
