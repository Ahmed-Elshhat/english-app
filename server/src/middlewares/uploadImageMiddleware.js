const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (req.baseUrl.startsWith("/api/v1/videos")) {
      const allowedTypes = ["application/x-subrip", "text/plain"];
      if (
        file.mimetype.startsWith("video") ||
        file.mimetype.startsWith("image") ||
        allowedTypes.includes(file.mimetype)
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError("Only Images, Videos, or SubRip (.srt) files allowed for this route", 400),
          false
        );
      }
    } else if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

exports.uploadSingleFile = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfFiles = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
