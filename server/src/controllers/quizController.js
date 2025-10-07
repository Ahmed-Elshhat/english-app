const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const Quiz = require("../models/quizModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const { uploadSingleFile } = require("../middlewares/uploadImageMiddleware");

exports.uploadQuizImage = uploadSingleFile("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Step 1: Create a unique filename for the uploaded image
  const fileName = `quiz-${uuidv4()}-${Date.now()}.jpeg`;

  // Step 2: If an image file was uploaded, resize & save it
  if (req.file) {
    // Process buffer -> resize -> convert -> save file
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`uploads/quizzes/${fileName}`);

    // Step 3: Attach filename to req.body so create/update controller can save it to DB
    req.body.image = fileName; // Save filename for DB
  }

  // Step 4: Continue
  next();
});

// @desc    Get list of quizzes
// @route    GET /api/v1/quizzes
// @access    Private
exports.getQuizzes = factory.getAll(Quiz, "Quizzes");

// @desc    Get specific quiz by id
// @route    GET /api/v1/quizzes/:id
// @access    Protect
exports.getQuiz = factory.getOne(Quiz);

// @desc    Get list of random quizzes
// @route    POST /api/v1/quizzes/random
// @access    protect
exports.getRandomQuizzes = asyncHandler(async (req, res) => {
  const { quizzesSize } = req.query;
  const { excludeIds = [] } = req.body;

  const objectIds = excludeIds.map(
    (id) => new mongoose.Types.ObjectId(String(id))
  );

  // 1 - Count how many quizzes are left after excluding the given IDs
  const totalCount = await Quiz.countDocuments({
    _id: { $nin: objectIds },
  });

  // 2 - Calculate the remaining count after this fetch (never negative)
  const remainingCount = Math.max(totalCount - (+quizzesSize || 20), 0);

  // 3 - Fetch a random batch of quizzes (limited by quizzesSize)
  const quizzes = await Quiz.aggregate([
    {
      $match: {
        _id: { $nin: objectIds },
      },
    },
    { $sample: { size: +quizzesSize || 20 } },
  ]);

  // 4 - Format quiz documents (add absolute image URL if exists)
  const formatted = quizzes.map((p) => ({
    ...p,
    imageUrl: p.image ? `${process.env.BASE_URL}/quizzes/${p.image}` : null,
  }));

  // 5 - Calculate how many pages are left based on the remaining count
  const remainingPages = Math.ceil(remainingCount / (+quizzesSize || 20));

  res.status(200).json({
    results: quizzes.length,
    total: remainingCount,
    remainingPages,
    quizzes: formatted,
  });
});

// @desc    Update specific quiz
// @route    PUT /api/v1/quizzes/:id
// @access    Private
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const newImage = req.body.image;

  const session = await mongoose.startSession();
  session.startTransaction();

  let newImagePath = null;

  try {
    // إذا فيه صورة جديدة، تحقق إنها موجودة على الـ disk
    if (newImage) {
      newImagePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "quizzes",
        newImage
      );
      if (!fs.existsSync(newImagePath)) {
        throw new ApiError("Uploaded image not found", 404);
      }
    }

    const quiz = await Quiz.findById(id).session(session);
    if (!quiz) {
      throw new ApiError("Quiz not found", 404);
    }

    // ==== validation for quizzes right answer is exist in answers characters ====

    const rightAnswerIsExist = quiz.questions?.some((q) => {
      const chars = q.answers?.map((a) => a.character) || [];
      return !chars.includes(q.rightAnswer);
    });

    if (rightAnswerIsExist) {
      throw new ApiError(
        "Each quiz question must have its right answer included in the answers list.",
        400
      );
    }

    // ==== validation for quizzes answers uniqueness ====

    const hasDuplicateChars = quiz.questions?.some((q) => {
      const chars = q.answers?.map((a) => a.character) || [];
      return new Set(chars).size !== chars.length; // لو في تكرار يرجع true
    });

    if (hasDuplicateChars) {
      throw new ApiError("Duplicate characters found in quiz answers", 400);
    }

    const videoId = req.body.videoId ? req.body.videoId : quiz.videoId;
    const quizNumber = req.body.quizNumber
      ? req.body.quizNumber
      : quiz.quizNumber;

    const duplicateQuiz = await Quiz.findOne({
      videoId,
      quizNumber,
      _id: { $ne: quiz._id },
    }).session(session);

    if (duplicateQuiz)
      throw new ApiError(
        `Quiz number ${quizNumber} already exists for this video.`,
        400
      );

    // تحديث الفلاش كارد
    const quizUpdated = await Quiz.findByIdAndUpdate(id, req.body, {
      new: true,
      session,
    });

    const oldImagePath = quiz.image
      ? path.join(__dirname, "..", "..", "uploads", "quizzes", quiz.image)
      : null;

    // حذف الصورة القديمة إذا موجودة ومختلفة عن الجديدة
    if (
      oldImagePath &&
      quiz.image !== newImage &&
      fs.existsSync(oldImagePath)
    ) {
      await fs.promises.unlink(oldImagePath);
    }

    // لو كل حاجة تمام، commit
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ data: quizUpdated });
  } catch (error) {
    // لو حصل أي خطأ قبل commit -> rollback DB
    await session.abortTransaction();
    session.endSession();

    // لو فيه صورة جديدة تم رفعها على القرص، نحذفها
    if (newImagePath && fs.existsSync(newImagePath)) {
      try {
        await fs.promises.unlink(newImagePath);
      } catch (err) {
        console.error(
          `Failed to delete new image after rollback: ${err.message}`
        );
      }
    }

    return next(error);
  }
});

// @desc    Delete specific quiz
// @route    PUT /api/v1/quizzes/:id
// @access    Private
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Step 1: Start session & transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 2: Get quiz inside session
    const quiz = await Quiz.findById(id).session(session);

    if (!quiz) {
      // Not found -> abort & return 404
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(`No quiz for this id ${id}`, 404));
    }

    // Step 3: Delete the quiz document
    await Quiz.findByIdAndDelete(id).session(session);

    // Step 4: If there is an image, attempt to delete the file from disk
    if (quiz.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/quizzes/${quiz.image}`
      );

      try {
        await fs.promises.unlink(oldImagePath);
      } catch (err) {
        // File deletion failed -> abort & return 500
        await session.abortTransaction();
        session.endSession();
        return next(
          new ApiError(
            "Quiz deletion failed because the image could not be deleted.",
            500
          )
        );
      }
    }

    // Step 5: Commit transaction and end session
    await session.commitTransaction();
    session.endSession();

    // Step 6: Successful deletion -> 204 No Content
    res.status(204).send();
  } catch (error) {
    // Step 7: On error -> abort & forward
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});
