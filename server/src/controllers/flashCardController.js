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
const addToGarbage = require("../utils/addToGarbage");

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

// دالة مساعدة بدل existsSync
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// @desc    Get list of flash cards
// @route    GET /api/v1/flashCards
// @access    Private
exports.getFlashCards = factory.getAll(FlashCard, "FlashCards");

// @desc    Get specific flash card by id
// @route    GET /api/v1/flashCards/:id
// @access    Protect
exports.getFlashCard = factory.getOne(FlashCard);

// @desc    Get list of random flash cards
// @route    POST /api/v1/flashCards/random
// @access    protect
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

// @desc    Update specific flash card
// @route   PUT /api/v1/flashCard/:id
// @access  Private
exports.updateFlashCard = asyncHandler(async (req, res, next) => {
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
        "flashCards",
        newImage
      );
      const exists = await fileExists(newImagePath);
      if (!exists) throw new ApiError("Uploaded image not found", 404);
    }

    // ✅ جلب الفلاش كارد داخل session
    const flashCard = await FlashCard.findById(id).session(session);
    if (!flashCard) throw new ApiError("Flash card not found", 404);

    // ✅ منع التكرار في نفس الفيديو
    const videoId = req.body.videoId || flashCard.videoId;
    const flashCardNumber =
      req.body.flashCardNumber || flashCard.flashCardNumber;

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

    // ✅ تحديث البيانات
    const flashCardUpdated = await FlashCard.findByIdAndUpdate(id, req.body, {
      new: true,
      session,
    });

    // ✅ لو فيه صورة قديمة ومختلفة عن الجديدة نحطها في Garbage
    if (newImage && flashCard.image !== newImage) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "flashCards",
        flashCard.image
      );
      const oldExists = await fileExists(oldImagePath);

      if (oldExists) {
        await addToGarbage(
          oldImagePath,
          `Old flash card image replaced during update (flashCardId: ${flashCard._id})`,
          session
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ data: flashCardUpdated });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // ⚠️ لو الصورة الجديدة اترفعت قبل الفشل → نحطها في Garbage
    if (newImagePath && (await fileExists(newImagePath))) {
      await addToGarbage(
        newImagePath,
        `New flash card image rolled back after failed update (flashCardId: ${id})`
      );
    }

    return next(error);
  }
});

// @desc    Delete specific flash card
// @route   DELETE /api/v1/flashCard/:id
// @access  Private
exports.deleteFlashCard = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const flashCard = await FlashCard.findById(id).session(session);
    if (!flashCard) throw new ApiError(`No flash card for this id ${id}`, 404);

    // ✅ حذف الفلاش كارد من الـ DB
    await FlashCard.findByIdAndDelete(id).session(session);

    // ✅ لو فيه صورة، نحطها في الـ Garbage بدل الحذف المباشر
    if (flashCard.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/flashCards/${flashCard.image}`
      );

      const exists = await fileExists(oldImagePath);
      if (exists) {
        await addToGarbage(
          oldImagePath,
          `Flash card deleted (flashCardId: ${flashCard._id}, videoId: ${flashCard.videoId})`,
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
