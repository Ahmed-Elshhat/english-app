const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const FlashCard = require("../models/flashCardModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const { uploadSingleFile } = require("../middlewares/uploadImageMiddleware");

exports.uploadFlashCardImage = uploadSingleFile("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Step 1: Create a unique filename for the uploaded image
  const fileName = `flashCard-${uuidv4()}-${Date.now()}.jpeg`;

  // Step 2: If an image file was uploaded, resize & save it
  if (req.file) {
    // Process buffer -> resize -> convert -> save file
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`uploads/flashCards/${fileName}`);

    // Step 3: Attach filename to req.body so create/update controller can save it to DB
    req.body.image = fileName; // Save filename for DB
  }

  // Step 4: Continue
  next();
});

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

exports.updateFlashCard = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const image = req.body.image;

  let imagePath = null;
  if (image) {
    imagePath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "flashCards",
      image
    );
    if (!fs.existsSync(imagePath)) {
      return next(new ApiError("Uploaded image not found", 404));
    }
  }

  const flashCard = await FlashCard.findById(id);
  if (!flashCard) {
    return next(new ApiError("flash card not found", 404));
  }

  const oldImagePath = path.join(
    __dirname,
    "..",
    "..",
    "uploads",
    "flashCards",
    flashCard.image
  );

  const flashCardUpdated = await FlashCard.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  try {
    if (fs.existsSync(oldImagePath)) await fs.promises.unlink(oldImagePath);
  } catch (error) {
    console.error(
      `Failed to delete uploaded file ${oldImagePath}: ${error.message}`
    );
  }

  res.status(200).json({ data: flashCardUpdated });
});

exports.updateFlashCard = asyncHandler(async (req, res, next) => {
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
        "flashCards",
        newImage
      );
      if (!fs.existsSync(newImagePath)) {
        throw new ApiError("Uploaded image not found", 404);
      }
    }

    // جلب الفلاش كارد داخل الـ session
    const flashCard = await FlashCard.findById(id).session(session);
    if (!flashCard) {
      throw new ApiError("Flash card not found", 404);
    }

    const videoId = req.body.videoId ? req.body.videoId : flashCard.videoId;
    const flashCardNumber = req.body.flashCardNumber
      ? req.body.flashCardNumber
      : flashCard.flashCardNumber;

    const duplicateFlashCard = await FlashCard.findOne({
      videoId,
      flashCardNumber,
      _id: { $ne: flashCard._id },
    }).session(session);

    if (duplicateFlashCard)
      throw new ApiError(
        `Flash card number ${flashCardNumber} already exists for this video.`,
        400
      );

    // تحديث الفلاش كارد
    const flashCardUpdated = await FlashCard.findByIdAndUpdate(id, req.body, {
      new: true,
      session,
    });

    const oldImagePath = flashCard.image
      ? path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "flashCards",
          flashCard.image
        )
      : null;

    // حذف الصورة القديمة إذا موجودة ومختلفة عن الجديدة
    if (
      oldImagePath &&
      flashCard.image !== newImage &&
      fs.existsSync(oldImagePath)
    ) {
      await fs.promises.unlink(oldImagePath);
    }

    // لو كل حاجة تمام، commit
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ data: flashCardUpdated });
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
