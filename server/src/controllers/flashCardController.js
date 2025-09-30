const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const FlashCard = require("../models/flashCardModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

exports.getFlashCards = factory.getAll(FlashCard, "FlashCards");
exports.getFlashCard = factory.getOne(FlashCard);

/**
 * Get random flash cards excluding certain IDs.
 * - flash cards Size defines how many to fetch (default 20)
 * - excludeIds ensures no duplicates from client cache
 *
 * Steps:
 * 1. Convert excludeIds to ObjectId for MongoDB filtering.
 * 2. Count how many flash cards are left after excluding the given IDs.
 * 3. Calculate the remaining count after fetching this batch.
 * 4. Fetch a random batch of flash cards using $sample.
 * 5. Format flash card documents (add absolute image URL if exists).
 * 6. Calculate how many pages remain based on remaining count.
 * 7. Return response with results, total, remainingPages, and flash cards.
 */

exports.getRandomFlashCards = asyncHandler(async (req, res) => {
  const { flashCardsSize } = req.query;
  const { excludeIds = [] } = req.body;

  const objectIds = excludeIds.map(
    (id) => new mongoose.Types.ObjectId(String(id))
  );

  // 1 - Count how many flash cards are left after excluding the given IDs
  const totalCount = await FlashCard.countDocuments({
    _id: { $nin: objectIds },
  });

  // 2 - Calculate the remaining count after this fetch (never negative)
  const remainingCount = Math.max(totalCount - (+flashCardsSize || 20), 0);

  // 3 - Fetch a random batch of flash cards (limited by flashCardsSize)
  const flashCards = await FlashCard.aggregate([
    {
      $match: {
        _id: { $nin: objectIds },
      },
    },
    { $sample: { size: +flashCardsSize || 20 } },
  ]);

  // 4 - Format flash card documents (add absolute image URL if exists)
  const formatted = flashCards.map((p) => ({
    ...p,
    imageUrl: p.image ? `${process.env.BASE_URL}/flashCards/${p.image}` : null,
  }));

  // 5 - Calculate how many pages are left based on the remaining count
  const remainingPages = Math.ceil(remainingCount / (+flashCardsSize || 20));

  res.status(200).json({
    results: flashCards.length,
    total: remainingCount,
    remainingPages,
    flashCards: formatted,
  });
});

/**
 * Delete a flash card by ID
 * - Uses transaction for safe deletion
 * - Also deletes associated image file if it exists
 */
exports.deleteFlashCard = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Step 1: Start session & transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 2: Get flash card inside session
    const flashCard = await FlashCard.findById(id).session(session);

    if (!flashCard) {
      // Not found -> abort & return 404
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(`No flash card for this id ${id}`, 404));
    }

    // Step 3: Delete the flash card document
    await FlashCard.findByIdAndDelete(id).session(session);

    // Step 4: If there is an image, attempt to delete the file from disk
    if (flashCard.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/flashCards/${flashCard.image}`
      );

      try {
        await fs.promises.unlink(oldImagePath);
      } catch (err) {
        // File deletion failed -> abort & return 500
        await session.abortTransaction();
        session.endSession();
        return next(
          new ApiError(
            "Flash card deletion failed because the image could not be deleted.",
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
