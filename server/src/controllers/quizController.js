const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Quiz = require("../models/quizModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

exports.getQuizzes = factory.getAll(Quiz, "Quizzes");
exports.getQuiz = factory.getOne(Quiz);

/**
 * Get random Quizzes excluding certain IDs.
 * - Quizzes Size defines how many to fetch (default 20)
 * - excludeIds ensures no duplicates from client cache
 *
 * Steps:
 * 1. Convert excludeIds to ObjectId for MongoDB filtering.
 * 2. Count how many Quizzes are left after excluding the given IDs.
 * 3. Calculate the remaining count after fetching this batch.
 * 4. Fetch a random batch of Quizzes using $sample.
 * 5. Format quiz documents (add absolute image URL if exists).
 * 6. Calculate how many pages remain based on remaining count.
 * 7. Return response with results, total, remainingPages, and Quizzes.
 */

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

/**
 * Delete a quiz by ID
 * - Uses transaction for safe deletion
 * - Also deletes associated image file if it exists
 */
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
