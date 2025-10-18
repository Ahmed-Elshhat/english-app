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
const addToGarbage = require("../utils/addToGarbage");

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

// دالة مساعدة بدل existsSync
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// @desc    Update specific quiz
// @route   PUT /api/v1/quizzes/:id
// @access  Private
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const newImage = req.body.image;

  const session = await mongoose.startSession();
  session.startTransaction();

  let newImagePath = null;

  try {
    // ✅ تحقق من وجود الصورة الجديدة (async)
    if (newImage) {
      newImagePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "quizzes",
        newImage
      );
      const exists = await fileExists(newImagePath);
      if (!exists) throw new ApiError("Uploaded image not found", 404);
    }

    // ✅ جلب الكويز داخل session
    const quiz = await Quiz.findById(id).session(session);
    if (!quiz) throw new ApiError("Quiz not found", 404);

    // ✅ تحقق من صحة الأسئلة والإجابات
    const rightAnswerInvalid = req.body.questions?.some((q) => {
      const chars = q.answers?.map((a) => a.character) || [];
      return !chars.includes(q.rightAnswer);
    });

    if (rightAnswerInvalid) {
      throw new ApiError(
        "Each quiz question must have its right answer included in the answers list.",
        400
      );
    }

    const hasDuplicateChars = req.body.questions?.some((q) => {
      const chars = q.answers?.map((a) => a.character) || [];
      return new Set(chars).size !== chars.length;
    });

    if (hasDuplicateChars) {
      throw new ApiError("Duplicate characters found in quiz answers", 400);
    }

    // ✅ تحقق من رقم الكويز وتكراره
    const videoId = req.body.videoId || quiz.videoId;
    const quizNumber = req.body.quizNumber || quiz.quizNumber;

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

    // ✅ تحديث البيانات
    const quizUpdated = await Quiz.findByIdAndUpdate(id, req.body, {
      new: true,
      session,
    });

    // ✅ لو فيه صورة قديمة ومختلفة عن الجديدة نحطها في الـ Garbage
    if (newImage && quiz.image !== newImage) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "quizzes",
        quiz.image
      );
      const oldExists = await fileExists(oldImagePath);

      if (oldExists) {
        await addToGarbage(
          oldImagePath,
          `Old quiz image replaced during update (quizId: ${quiz._id})`,
          session
        );
      }
    }

    // ✅ لو كل حاجة تمام
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ data: quizUpdated });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // ⚠️ لو الصورة الجديدة اترفعت قبل الفشل → نحطها في Garbage
    if (newImagePath && (await fileExists(newImagePath))) {
      await addToGarbage(
        newImagePath,
        `New quiz image rolled back after failed update (quizId: ${id})`
      );
    }

    return next(error);
  }
});

// @desc    Delete specific quiz
// @route   DELETE /api/v1/quizzes/:id
// @access  Private
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const quiz = await Quiz.findById(id).session(session);
    if (!quiz) throw new ApiError(`No quiz for this id ${id}`, 404);

    // ✅ حذف الكويز من الـ DB
    await Quiz.findByIdAndDelete(id).session(session);

    // ✅ لو فيه صورة، نحطها في الـ Garbage بدل الحذف المباشر
    if (quiz.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/quizzes/${quiz.image}`
      );

      const exists = await fileExists(oldImagePath);
      if (exists) {
        await addToGarbage(
          oldImagePath,
          `Quiz deleted (quizId: ${quiz._id}, videoId: ${quiz.videoId})`,
          session
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(204).send();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});
