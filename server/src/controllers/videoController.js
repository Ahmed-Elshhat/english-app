const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const ffprobeStatic = require("ffprobe-static");
const mongoose = require("mongoose");
const parser = require("subtitles-parser");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const { uploadMixOfFiles } = require("../middlewares/uploadImageMiddleware");
const Video = require("../models/videoModel");
const Playlist = require("../models/playlistModel");
const Episode = require("../models/episodeModel");
const FlashCard = require("../models/flashCardModel");
const Quiz = require("../models/quizModel");

function parseSubtitleFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return parser.fromSrt(content, true);
}

ffmpeg.setFfprobePath(ffprobeStatic.path);

exports.uploadVideoFiles = uploadMixOfFiles([
  {
    name: "video",
    maxCount: 1,
  },
  {
    name: "videoImage",
    maxCount: 1,
  },
  {
    name: "flashCardsImages",
  },
  {
    name: "quizzesImages",
  },
  {
    name: "subtitleEn",
    maxCount: 1,
  },
  {
    name: "subtitleAr",
    maxCount: 1,
  },
]);

exports.resizeVideoFiles = asyncHandler(async (req, res, next) => {
  const uploadedFiles = [];
  try {
    if (!req.files) {
      req.files = {};
    }

    // ✅ 1- التعامل مع الفيديو
    if (req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];

      // اتأكد إن الملف نوعه فيديو
      if (!videoFile.mimetype.startsWith("video")) {
        return next(new ApiError("Only video files are allowed", 400));
      }

      // اسم مميز للفيديو
      const videoFileName = `video-${uuidv4()}-${Date.now()}${path.extname(videoFile.originalname)}`;

      // نخزن الفيديو زي ما هو (مش هنعمل ضغط زي الصور)
      const videoPath = path.join("uploads/videos", videoFileName);

      // نكتب الملف من الـ buffer
      fs.writeFileSync(videoPath, videoFile.buffer);

      // نخزن الاسم في الـ req.body
      uploadedFiles.push(
        path.join(__dirname, "..", "uploads", "videos", videoFileName)
      );
      req.body.video = videoFileName;
    }

    // ✅ 2- التعامل مع صورة الفيديو (videoImage)
    if (req.files.videoImage && req.files.videoImage[0]) {
      const imageFile = req.files.videoImage[0];

      if (!imageFile.mimetype.startsWith("image")) {
        return next(
          new ApiError("Only image files are allowed for videoImage", 400)
        );
      }

      // اسم مميز للصورة
      const imageFileName = `videoImage-${uuidv4()}-${Date.now()}.jpeg`;

      // نعمل Resize ونحفظها
      await sharp(imageFile.buffer)
        .resize(600, 600)
        .toFormat("jpeg")
        .jpeg({ quality: 75 }) // تقلل الجودة
        .toFile(`uploads/videosImages/${imageFileName}`);

      // نخزن الاسم في req.body
      uploadedFiles.push(
        path.join(__dirname, "..", "uploads", "videosImages", imageFileName)
      );
      req.body.videoImage = imageFileName;
    }

    // ✅ 3- التعامل مع صور الـ flashCardsImages
    if (
      req.files.flashCardsImages &&
      Array.isArray(req.files.flashCardsImages)
    ) {
      req.body.flashCardsImages = []; // نجهز Array

      await Promise.all(
        req.files.flashCardsImages.map(async (imgFile) => {
          if (!imgFile.mimetype.startsWith("image")) {
            return next(
              new ApiError(
                "Only image files are allowed for flashCardsImages",
                400
              )
            );
          }

          // ناخد الاسم الأصلي من غير الـ extension
          const originalName = path.parse(imgFile.originalname).name;

          // نعمل اسم جديد مميز
          const newFileName = `flashCard-${uuidv4()}-${Date.now()}.jpeg`;

          // نغير الحجم والجودة
          await sharp(imgFile.buffer)
            .resize(600, 600)
            .toFormat("jpeg")
            .jpeg({ quality: 75 })
            .toFile(`uploads/flashCards/${newFileName}`);

          uploadedFiles.push(
            path.join(__dirname, "..", "uploads", "flashCards", newFileName)
          );
          // نضيف الـ object في الـ array
          req.body.flashCardsImages.push({
            originalName,
            newName: newFileName,
          });
        })
      );
    }

    // ✅ 4- التعامل مع صور الـ quizzesImages
    if (req.files.quizzesImages && Array.isArray(req.files.quizzesImages)) {
      req.body.quizzesImages = [];

      await Promise.all(
        req.files.quizzesImages.map(async (imgFile) => {
          if (!imgFile.mimetype.startsWith("image")) {
            return next(
              new ApiError(
                "Only image files are allowed for quizzesImages",
                400
              )
            );
          }

          const originalName = path.parse(imgFile.originalname).name;
          const newFileName = `quiz-${uuidv4()}-${Date.now()}.jpeg`;

          await sharp(imgFile.buffer)
            .resize(600, 600)
            .toFormat("jpeg")
            .jpeg({ quality: 75 })
            .toFile(`uploads/quizzes/${newFileName}`);

          uploadedFiles.push(
            path.join(__dirname, "..", "uploads", "quizzes", newFileName)
          );
          req.body.quizzesImages.push({
            originalName,
            newName: newFileName,
          });
        })
      );
    }

    if (req.files.subtitleEn && req.files.subtitleEn[0]) {
      const subtitleEnFile = req.files.subtitleEn[0];

      const allowedTypes = ["application/x-subrip", "text/plain"];
      if (!allowedTypes.includes(subtitleEnFile.mimetype)) {
        return next(new ApiError("Only .srt files are allowed", 400));
      }

      const subtitleEnFileName = `video-${uuidv4()}-${Date.now()}${path.extname(subtitleEnFile.originalname)}`;

      const subtitleEnPath = path.join("uploads/subtitles", subtitleEnFileName);

      fs.writeFileSync(subtitleEnPath, subtitleEnFile.buffer);

      uploadedFiles.push(
        path.join(__dirname, "..", "uploads", "subtitles", subtitleEnFileName)
      );
      req.body.subtitleEn = subtitleEnFileName;
    }

    if (req.files.subtitleAr && req.files.subtitleAr[0]) {
      const subtitleArFile = req.files.subtitleAr[0];

      const allowedTypes = ["application/x-subrip", "text/plain"];
      if (!allowedTypes.includes(subtitleArFile.mimetype)) {
        return next(new ApiError("Only .srt files are allowed", 400));
      }

      const subtitleArFileName = `video-${uuidv4()}-${Date.now()}${path.extname(subtitleArFile.originalname)}`;

      const subtitleArPath = path.join("uploads/subtitles", subtitleArFileName);

      fs.writeFileSync(subtitleArPath, subtitleArFile.buffer);

      uploadedFiles.push(
        path.join(__dirname, "..", "uploads", "subtitles", subtitleArFileName)
      );
      req.body.subtitleAr = subtitleArFileName;
    }
  } catch (err) {
    uploadedFiles.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    });

    return next(err);
  }
  next();
});

exports.parseJSON = asyncHandler(async (req, res, next) => {
  let flashCards = req.body.flashCards;
  let quizzes = req.body.quizzes;
  let excludeIds = req.body.excludeIds;
  let deleteFlashCards = req.body.deleteFlashCards;
  let deleteQuizzes = req.body.deleteQuizzes;

  // Step 2: Parse flash cards if needed
  if (
    flashCards != null &&
    flashCards !== "" &&
    !Array.isArray(req.body.flashCards)
  ) {
    try {
      // Convert JSON string to array/object
      req.body.flashCards = JSON.parse(req.body.flashCards);
    } catch (error) {
      // Bad format -> return 400
      return next(new ApiError("Invalid flash cards format.", 400));
    }
  }

  // Step 3: Parse quizzes if needed
  if (quizzes != null && quizzes !== "" && !Array.isArray(req.body.quizzes)) {
    try {
      // Convert JSON string to array
      req.body.quizzes = JSON.parse(req.body.quizzes);
    } catch (error) {
      // Bad format -> return 400
      return next(new ApiError("Invalid quizzes Ids format.", 400));
    }
  }

  // Step 4: Parse excludeIds if needed
  if (
    excludeIds != null &&
    excludeIds !== "" &&
    !Array.isArray(req.body.excludeIds)
  ) {
    try {
      // Convert JSON string to array
      req.body.excludeIds = JSON.parse(req.body.excludeIds);
    } catch (error) {
      // Bad format -> return 400
      return next(new ApiError("Invalid exclude Ids format.", 400));
    }
  }

  // Step 5: Parse deleteFlashCards if needed
  if (
    deleteFlashCards != null &&
    deleteFlashCards !== "" &&
    !Array.isArray(req.body.deleteFlashCards)
  ) {
    try {
      // Convert JSON string to array
      req.body.deleteFlashCards = JSON.parse(req.body.deleteFlashCards);
    } catch (error) {
      // Bad format -> return 400
      return next(new ApiError("Invalid delete flash cards format.", 400));
    }
  }

  // Step 6: Parse deleteQuizzes if needed
  if (
    deleteQuizzes != null &&
    deleteQuizzes !== "" &&
    !Array.isArray(req.body.deleteQuizzes)
  ) {
    try {
      // Convert JSON string to array
      req.body.deleteQuizzes = JSON.parse(req.body.deleteQuizzes);
    } catch (error) {
      // Bad format -> return 400
      return next(new ApiError("Invalid delete quizzes format.", 400));
    }
  }

  // Step 7: Continue
  next();
});

// helper: probe duration (seconds, float)
function getVideoDurationSeconds(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata && metadata.format && metadata.format.duration;
      if (!duration)
        return reject(new Error("Unable to detect video duration"));
      resolve(duration);
    });
  });
}

// optional: format seconds to mm:ss (if you want)
function formatDuration(seconds) {
  const sec = Math.round(seconds);
  const minutes = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function validateAndMapImagesToItems({
  imagesArray, // req.body.flashCardsImages or req.body.quizzesImages
  itemsArray, // req.body.flashCards or req.body.quizzes
  itemNumberField, // "flashCardNumber" or "quizNumber"
  imageTypeLabel, // "flash card" أو "quiz"
}) {
  const hasImages = Array.isArray(imagesArray) && imagesArray.length > 0;
  const hasItems = Array.isArray(itemsArray) && itemsArray.length > 0;

  // لو بعت عناصر من غير صور
  if (hasItems && !hasImages) {
    return {
      ok: false,
      message: `You provided ${imageTypeLabel}s but no ${imageTypeLabel} images in request body.`,
    };
  }

  // لو بعت صور من غير عناصر
  if (hasImages && !hasItems) {
    return {
      ok: false,
      message: `You provided ${imageTypeLabel} images but no corresponding ${imageTypeLabel}s in request body.`,
    };
  }

  // لو مفيش لا صور ولا عناصر → عادي
  if (!hasItems && !hasImages) {
    return { ok: true };
  }

  // لو العدد مش متساوي
  if (imagesArray.length !== itemsArray.length) {
    return {
      ok: false,
      message: `Number of ${imageTypeLabel} images (${imagesArray.length}) must equal number of ${imageTypeLabel}s (${itemsArray.length}).`,
    };
  }

  // تحقق من وجود رقم لكل عنصر
  const itemNumbers = itemsArray.map((it, idx) => {
    const val = it[itemNumberField];
    if (val === undefined || val === null || val === "") {
      throw new Error(
        `Each ${imageTypeLabel} must include '${itemNumberField}'. Missing at index ${idx}.`
      );
    }
    return String(val);
  });

  // منع التكرار في الأرقام
  if (new Set(itemNumbers).size !== itemNumbers.length) {
    return {
      ok: false,
      message: `Duplicate ${itemNumberField} found in ${imageTypeLabel}s. Each must be unique.`,
    };
  }

  // منع التكرار في أسماء الصور
  const originalNames = imagesArray.map((img) => String(img.originalName));
  if (new Set(originalNames).size !== originalNames.length) {
    return {
      ok: false,
      message: `Duplicate originalName found in uploaded ${imageTypeLabel} images. Each must be unique.`,
    };
  }

  // تحقق من التطابق بين الأسماء والأرقام
  const missingMatches = originalNames.filter(
    (orig) => !itemNumbers.includes(orig)
  );
  if (missingMatches.length > 0) {
    return {
      ok: false,
      message: `These originalName(s) don't match any ${itemNumberField}: ${missingMatches.join(
        ", "
      )}`,
    };
  }

  // mapping الصور مع العناصر
  imagesArray.forEach((img) => {
    const orig = String(img.originalName);
    const item = itemsArray.find((it) => String(it[itemNumberField]) === orig);
    if (item) item.image = img.newName;
  });

  return { ok: true };
}

exports.createVideo = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  // جمع كل الملفات المرفوعة في مصفوفة للحذف لو حصل خطأ
  const uploadedFiles = [];

  try {
    const {
      title,
      description,
      videoImage,
      playlistId,
      seasonNumber,
      episodeId,
      flashCards,
      quizzes,
      videoNumber,
    } = req.body;

    // جمع كل الصور في uploadedFiles للحذف لو حصل خطأ
    if (videoImage)
      uploadedFiles.push(
        path.join(__dirname, "..", "..", "uploads", "videosImages", videoImage)
      );
    if (Array.isArray(req.body.flashCardsImages)) {
      req.body.flashCardsImages.forEach((img) =>
        uploadedFiles.push(
          path.join(__dirname, "..", "..", "uploads", "flashCards", img.newName)
        )
      );
    }
    if (Array.isArray(req.body.quizzesImages)) {
      req.body.quizzesImages.forEach((img) =>
        uploadedFiles.push(
          path.join(__dirname, "..", "..", "uploads", "quizzes", img.newName)
        )
      );
    }

    if (!req.body.video) {
      throw new ApiError("No video file found in body request", 400);
    }

    const videoFileName = req.body.video;
    const videoPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "videos",
      videoFileName
    );

    if (!fs.existsSync(videoPath)) {
      throw new ApiError("Uploaded video file not found on server", 400);
    }

    uploadedFiles.push(videoPath);

    if (!req.body.subtitleEn) {
      throw new ApiError(
        "No video english subtitle file found in body request",
        400
      );
    }
    const subtitleEnFileName = req.body.subtitleEn;
    const subtitleEnPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "subtitles",
      subtitleEnFileName
    );

    if (!fs.existsSync(subtitleEnPath)) {
      throw new ApiError(
        "Uploaded video english subtitle file not found on server",
        400
      );
    }

    uploadedFiles.push(subtitleEnPath);

    if (!req.body.subtitleAr) {
      throw new ApiError(
        "No video arabic subtitle file found in body request",
        400
      );
    }
    const subtitleArFileName = req.body.subtitleAr;
    const subtitleArPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "subtitles",
      subtitleArFileName
    );

    if (!fs.existsSync(subtitleArPath)) {
      throw new ApiError(
        "Uploaded video arabic subtitle file not found on server",
        400
      );
    }

    uploadedFiles.push(subtitleArPath);

    const subtitleEnJSON = parseSubtitleFile(subtitleEnPath);
    const subtitleArJSON = parseSubtitleFile(subtitleArPath);

    let durationSeconds = 0;
    try {
      durationSeconds = await getVideoDurationSeconds(videoPath);
    } catch (err) {
      throw new ApiError(`Failed to read video duration: ${err.message}`, 400);
    }

    req.body.duration = Math.round(durationSeconds);
    req.body.durationFormatted = formatDuration(durationSeconds);

    // تحقق من الـ playlist
    const playlist = await Playlist.findById(playlistId).session(session);
    if (!playlist)
      throw new ApiError(`Playlist not found with id ${playlistId}`, 404);

    if (playlist.type === "movie" && episodeId)
      throw new ApiError(
        "This playlist is a movie, you cannot attach an episode to it.",
        400
      );

    if (playlist.type === "series" && !episodeId)
      throw new ApiError(
        "You must provide a valid episode Id when adding a video to a series playlist.",
        400
      );

    // تحقق من الـ seasonNumber
    if (seasonNumber) {
      const seasonExists = playlist.seasons?.some(
        (s) => s.seasonNumber === Number(seasonNumber)
      );
      if (!seasonExists)
        throw new ApiError(
          `Season number ${seasonNumber} does not exist in playlist ${playlistId}`,
          400
        );
    }

    // تحقق من الـ episode
    if (episodeId) {
      const episode = await Episode.findById(episodeId).session(session);
      if (!episode)
        throw new ApiError(`Episode not found with id ${episodeId}`, 404);

      // 🔹 تحقق إن الحلقة دي فعلاً بتخص الـ playlist دا
      if (episode.playlistId.toString() !== playlistId.toString()) {
        throw new ApiError(
          `Episode ${episodeId} does not belong to playlist ${playlistId}`,
          400
        );
      }

      // 🔹 تحقق إن الحلقة دي فعلاً في نفس الـ season
      if (seasonNumber && episode.seasonNumber !== Number(seasonNumber)) {
        throw new ApiError(
          `Episode ${episodeId} does not belong to season ${seasonNumber}`,
          400
        );
      }

      if (playlist.type === "series") {
        episode.duration += Number(req.body.duration);
        await episode.save({ session });
      }
    }

    // تحقق من uniqueness للفيديو
    const existingVideo = await Video.findOne({
      playlistId,
      seasonNumber: seasonNumber ? +seasonNumber : null,
      episodeId: episodeId || null,
      videoNumber: videoNumber ? +videoNumber : null,
    }).session(session);

    if (existingVideo)
      throw new ApiError(
        `A video already exists in this playlist with season ${seasonNumber}, episode ${episodeId || "N/A"}, and videoNumber ${videoNumber}`,
        400
      );

    // ==== validation for quizzes right answer is exist in answers characters ====
    if (Array.isArray(quizzes) && quizzes.length > 0) {
      const rightAnswerIsExist = quizzes.some((quiz) =>
        quiz.questions?.some((q) => {
          const chars = q.answers?.map((a) => a.character) || [];
          return !chars.includes(q.rightAnswer);
        })
      );

      if (rightAnswerIsExist)
        throw new ApiError(
          "Each quiz question must have its right answer included in the answers list.",
          400
        );
    }

    // ==== validation for quizzes answers uniqueness ====
    if (Array.isArray(quizzes) && quizzes.length > 0) {
      const hasDuplicateChars = quizzes.some((quiz) =>
        quiz.questions?.some((q) => {
          const chars = q.answers?.map((a) => a.character) || [];
          return new Set(chars).size !== chars.length; // لو في تكرار يرجع true
        })
      );

      if (hasDuplicateChars)
        throw new ApiError("Duplicate characters found in quiz answers", 400);
    }

    // ==== validation & mapping for flashCardsImages ====
    try {
      const flashRes = validateAndMapImagesToItems({
        imagesArray: req.body.flashCardsImages,
        itemsArray: flashCards,
        itemNumberField: "flashCardNumber",
        imageTypeLabel: "flash card",
      });
      if (!flashRes.ok) throw new ApiError(flashRes.message, 400);
    } catch (err) {
      throw new ApiError(err.message, 400);
    }

    // ==== validation & mapping for quizzesImages ====
    try {
      const quizRes = validateAndMapImagesToItems({
        imagesArray: req.body.quizzesImages,
        itemsArray: quizzes,
        itemNumberField: "quizNumber",
        imageTypeLabel: "quiz",
      });
      if (!quizRes.ok) throw new ApiError(quizRes.message, 400);
    } catch (err) {
      throw new ApiError(err.message, 400);
    }

    // إنشاء الفيديو داخل transaction
    const newVideo = await Video.create(
      [
        {
          title,
          description,
          duration: req.body.duration,
          durationFormatted: req.body.durationFormatted,
          image: videoImage,
          video: videoFileName,
          subtitleEn: subtitleEnFileName,
          subtitleAr: subtitleArFileName,
          playlistId,
          seasonNumber: seasonNumber ? +seasonNumber : null,
          episodeId: episodeId || null,
          videoNumber,
        },
      ],
      { session }
    );

    // ==== بعد إنشاء الفيديو، نضيف الـ flashCards والـ quizzes ====
    if (Array.isArray(flashCards) && flashCards.length > 0) {
      const flashCardsWithVideo = flashCards.map((fc) => ({
        ...fc,
        videoId: newVideo[0]._id,
      }));
      await FlashCard.insertMany(flashCardsWithVideo, { session });
    }

    if (Array.isArray(quizzes) && quizzes.length > 0) {
      const quizzesWithVideo = quizzes.map((qz) => ({
        ...qz,
        videoId: newVideo[0]._id, // ربط بالـ video
      }));
      await Quiz.insertMany(quizzesWithVideo, { session });
    }

    const finalResultForVideo = await Video.findById(newVideo[0]._id)
      .populate("flashCards")
      .populate("quizzes")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      data: finalResultForVideo,
      subtitleEnJSON,
      subtitleArJSON,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // مسح كل الصور المرفوعة لو حصل خطأ
    uploadedFiles.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    });

    return next(err);
  }
});

exports.getVideos = factory.getAll(Video, "Videos", ["flashCards", "quizzes"]);

exports.getVideo = factory.getOne(Video, ["flashCards", "quizzes"]);

/**
 * Get random videos excluding certain IDs.
 * - videosSize defines how many to fetch (default 20)
 * - excludeIds ensures no duplicates from client cache
 *
 * Steps:
 * 1. Convert excludeIds to ObjectId for MongoDB filtering.
 * 2. Count how many videos are left after excluding the given IDs.
 * 3. Calculate the remaining count after fetching this batch.
 * 4. Fetch a random batch of videos using $sample.
 * 5. Format video documents (add absolute image URL if exists).
 * 6. Calculate how many pages remain based on remaining count.
 * 7. Return response with results, total, remainingPages, and videos.
 */

exports.getRandomVideos = asyncHandler(async (req, res) => {
  const { videosSize } = req.query;
  const { excludeIds = [] } = req.body;

  const objectIds = excludeIds.map(
    (id) => new mongoose.Types.ObjectId(String(id))
  );

  // 1 - Count how many videos are left after excluding the given IDs
  const totalCount = await Video.countDocuments({
    _id: { $nin: objectIds },
  });

  // 2 - Calculate the remaining count after this fetch (never negative)
  const remainingCount = Math.max(totalCount - (+videosSize || 20), 0);

  // 3 - Fetch a random batch of videos (limited by videosSize)
  const videos = await Video.aggregate([
    {
      $match: {
        _id: { $nin: objectIds },
      },
    },
    { $sample: { size: +videosSize || 20 } },
  ]);

  // 4 - Format video documents (add absolute image URL if exists)
  const formatted = videos.map((p) => ({
    ...p,
    videoUrl: p.video ? `${process.env.BASE_URL}/videos/${p.video}` : null,
    imageUrl: p.image
      ? `${process.env.BASE_URL}/videosImages/${p.image}`
      : null,
  }));

  // 5 - Calculate how many pages are left based on the remaining count
  const remainingPages = Math.ceil(remainingCount / (+videosSize || 20));

  res.status(200).json({
    results: videos.length,
    total: remainingCount,
    remainingPages,
    videos: formatted,
  });
});

exports.updateVideo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  const uploadedFiles = []; // ملفات جديدة نحذفها لو حصل خطأ
  const oldFilesToDelete = []; // ملفات فيديو/cover/subtitles القديمة نحذفها بعد الـ commit
  const filesToDeleteAfterCommit = []; // ملفات فلاش كاردز/كوويز اللي المستخدم طلب حذفها

  try {
    // Helper function
    const pushIfExists = (fileName, folder) => {
      if (!fileName) return null;
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        folder,
        fileName
      );
      if (fs.existsSync(filePath)) {
        uploadedFiles.push(filePath);
        return filePath;
      }
      return null;
    };

    // 1) التعامل مع الملفات الجديدة (فيديو / Subtitles / صور)
    const videoPath = pushIfExists(req.body.video, "videos");
    const subtitleEnPath = pushIfExists(req.body.subtitleEn, "subtitles");
    const subtitleArPath = pushIfExists(req.body.subtitleAr, "subtitles");
    const videoImagePath = pushIfExists(req.body.videoImage, "videosImages");

    if (Array.isArray(req.body.flashCardsImages)) {
      req.body.flashCardsImages.forEach((img) =>
        pushIfExists(img.newName, "flashCards")
      );
    }
    if (Array.isArray(req.body.quizzesImages)) {
      req.body.quizzesImages.forEach((img) =>
        pushIfExists(img.newName, "quizzes")
      );
    }

    // 2) جلب الفيديو القديم
    const video = await Video.findById(id).session(session);
    if (!video) throw new ApiError(`No video found for id ${id}`, 404);

    // حساب مدة الفيديو لو فيه ملف جديد
    if (videoPath) {
      let durationSeconds;
      try {
        durationSeconds = await getVideoDurationSeconds(videoPath);
      } catch (err) {
        throw new ApiError(
          `Failed to read video duration: ${err.message}`,
          400
        );
      }
      req.body.duration = Math.round(durationSeconds);
      req.body.durationFormatted = formatDuration(durationSeconds);
    }

    // 3) playlist / episode / season logic
    const newPlaylistId = Object.prototype.hasOwnProperty.call(
      req.body,
      "playlistId"
    )
      ? req.body.playlistId
      : video.playlistId;

    const playlist = await Playlist.findById(newPlaylistId).session(session);
    if (!playlist)
      throw new ApiError(`Playlist not found with id ${newPlaylistId}`, 404);

    if (
      playlist.type === "movie" &&
      Object.prototype.hasOwnProperty.call(req.body, "episodeId")
    ) {
      throw new ApiError(
        "This playlist is a movie, you cannot attach an episode to it.",
        400
      );
    }

    const resultingEpisodeId = Object.prototype.hasOwnProperty.call(
      req.body,
      "episodeId"
    )
      ? req.body.episodeId
      : video.episodeId
        ? String(video.episodeId)
        : null;

    if (playlist.type === "series" && !resultingEpisodeId) {
      throw new ApiError(
        "You must provide a valid episode Id when adding/updating a video in a series playlist.",
        400
      );
    }

    const resultingSeasonNumber = Object.prototype.hasOwnProperty.call(
      req.body,
      "seasonNumber"
    )
      ? Number(req.body.seasonNumber)
      : video.seasonNumber;

    if (resultingSeasonNumber) {
      const seasonExists = playlist.seasons?.some(
        (s) => s.seasonNumber === Number(resultingSeasonNumber)
      );
      if (!seasonExists)
        throw new ApiError(
          `Season number ${resultingSeasonNumber} does not exist in playlist ${newPlaylistId}`,
          400
        );
    }

    if (resultingEpisodeId) {
      const episode =
        await Episode.findById(resultingEpisodeId).session(session);
      if (!episode)
        throw new ApiError(
          `Episode not found with id ${resultingEpisodeId}`,
          404
        );
      if (String(episode.playlistId) !== String(newPlaylistId))
        throw new ApiError(
          `Episode ${resultingEpisodeId} does not belong to playlist ${newPlaylistId}`,
          400
        );
      if (
        resultingSeasonNumber &&
        episode.seasonNumber !== Number(resultingSeasonNumber)
      ) {
        throw new ApiError(
          `Episode ${resultingEpisodeId} does not belong to season ${resultingSeasonNumber}`,
          400
        );
      }
    }

    // 4) uniqueness check
    const resultingVideoNumber = Object.prototype.hasOwnProperty.call(
      req.body,
      "videoNumber"
    )
      ? Number(req.body.videoNumber)
      : video.videoNumber;

    const duplicateVideo = await Video.findOne({
      playlistId: newPlaylistId,
      seasonNumber:
        resultingSeasonNumber != null ? Number(resultingSeasonNumber) : null,
      episodeId: resultingEpisodeId ?? null,
      videoNumber: resultingVideoNumber,
      _id: { $ne: video._id },
    }).session(session);

    if (duplicateVideo)
      throw new ApiError(
        `A video already exists in this playlist with season ${resultingSeasonNumber}, episode ${resultingEpisodeId || "N/A"}, and videoNumber ${resultingVideoNumber}`,
        400
      );

    // 5) validate quizzes payload
    const quizzesPayload = req.body.quizzes;
    if (Array.isArray(quizzesPayload) && quizzesPayload.length > 0) {
      const rightAnswerIsMissing = quizzesPayload.some((quiz) =>
        quiz.questions?.some((q) => {
          const chars = q.answers?.map((a) => a.character) || [];
          return !chars.includes(q.rightAnswer);
        })
      );
      if (rightAnswerIsMissing)
        throw new ApiError(
          "Each quiz question must have its right answer included in the answers list.",
          400
        );

      const hasDuplicateChars = quizzesPayload.some((quiz) =>
        quiz.questions?.some((q) => {
          const chars = q.answers?.map((a) => a.character) || [];
          return new Set(chars).size !== chars.length;
        })
      );
      if (hasDuplicateChars)
        throw new ApiError("Duplicate characters found in quiz answers", 400);
    }

    // 6) validate flashCards/quizzes images
    try {
      const flashRes = validateAndMapImagesToItems({
        imagesArray: req.body.flashCardsImages,
        itemsArray: req.body.flashCards,
        itemNumberField: "flashCardNumber",
        imageTypeLabel: "flash card",
      });
      if (!flashRes.ok) throw new ApiError(flashRes.message, 400);
    } catch (err) {
      throw new ApiError(err.message, 400);
    }

    try {
      const quizRes = validateAndMapImagesToItems({
        imagesArray: req.body.quizzesImages,
        itemsArray: req.body.quizzes,
        itemNumberField: "quizNumber",
        imageTypeLabel: "quiz",
      });
      if (!quizRes.ok) throw new ApiError(quizRes.message, 400);
    } catch (err) {
      throw new ApiError(err.message, 400);
    }

    // 7) تعديل مدة الـ Episode
    const oldEpisodeIdStr = video.episodeId ? String(video.episodeId) : null;
    const newEpisodeIdStr = resultingEpisodeId
      ? String(resultingEpisodeId)
      : null;
    const oldDuration = Number(video.duration || 0);
    const newDuration = Number(
      Object.prototype.hasOwnProperty.call(req.body, "duration")
        ? req.body.duration
        : oldDuration
    );

    if (
      oldEpisodeIdStr &&
      (oldEpisodeIdStr !== newEpisodeIdStr || oldDuration !== newDuration)
    ) {
      const oldEpisode =
        await Episode.findById(oldEpisodeIdStr).session(session);
      if (oldEpisode) {
        oldEpisode.duration = Math.max(
          0,
          Number(oldEpisode.duration || 0) - oldDuration
        );
        await oldEpisode.save({ session });
      }
    }

    if (
      newEpisodeIdStr &&
      (oldEpisodeIdStr !== newEpisodeIdStr || oldDuration !== newDuration)
    ) {
      const newEpisode =
        await Episode.findById(newEpisodeIdStr).session(session);
      if (newEpisode) {
        newEpisode.duration = Number(newEpisode.duration || 0) + newDuration;
        await newEpisode.save({ session });
      }
    }

    // 8) تحديث الفيديو نفسه
    if (Object.prototype.hasOwnProperty.call(req.body, "title"))
      video.title = req.body.title;
    if (Object.prototype.hasOwnProperty.call(req.body, "description"))
      video.description = req.body.description;

    video.duration = newDuration;
    video.durationFormatted = formatDuration(newDuration);

    video.playlistId = newPlaylistId;
    video.seasonNumber = resultingSeasonNumber
      ? Number(resultingSeasonNumber)
      : null;
    video.episodeId = resultingEpisodeId || null;
    video.videoNumber = resultingVideoNumber;

    if (Object.prototype.hasOwnProperty.call(req.body, "videoImage")) {
      if (video.image)
        oldFilesToDelete.push(
          path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            "videosImages",
            video.image
          )
        );
      video.image = req.body.videoImage;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "video")) {
      if (video.video)
        oldFilesToDelete.push(
          path.join(__dirname, "..", "..", "uploads", "videos", video.video)
        );
      video.video = req.body.video;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "subtitleEn")) {
      if (video.subtitleEn)
        oldFilesToDelete.push(
          path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            "subtitles",
            video.subtitleEn
          )
        );
      video.subtitleEn = req.body.subtitleEn;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "subtitleAr")) {
      if (video.subtitleAr)
        oldFilesToDelete.push(
          path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            "subtitles",
            video.subtitleAr
          )
        );
      video.subtitleAr = req.body.subtitleAr;
    }

    await video.save({ session });

    // 9) إضافة flashCards جديدة
    if (Array.isArray(req.body.flashCards) && req.body.flashCards.length > 0) {
      const flashCardsWithVideo = req.body.flashCards.map((fc) => ({
        ...fc,
        videoId: video._id,
      }));
      await FlashCard.insertMany(flashCardsWithVideo, { session });
    }

    // 10) حذف flashCards
    if (
      Array.isArray(req.body.deleteFlashCards) &&
      req.body.deleteFlashCards.length > 0
    ) {
      const flashCardsToDelete = await FlashCard.find({
        _id: { $in: req.body.deleteFlashCards },
        videoId: video._id,
      }).session(session);

      if (flashCardsToDelete.length !== req.body.deleteFlashCards.length) {
        throw new ApiError(
          "Some flashCard IDs provided do not exist or do not belong to this video",
          400
        );
      }

      flashCardsToDelete.forEach((fc) => {
        if (fc.image)
          filesToDeleteAfterCommit.push(
            path.join(__dirname, "..", "..", "uploads", "flashCards", fc.image)
          );
      });

      await FlashCard.deleteMany({
        _id: { $in: req.body.deleteFlashCards },
        videoId: video._id,
      }).session(session);
    }

    // 11) إضافة quizzes جديدة
    if (Array.isArray(req.body.quizzes) && req.body.quizzes.length > 0) {
      const quizzesWithVideo = req.body.quizzes.map((qz) => ({
        ...qz,
        videoId: video._id,
      }));
      await Quiz.insertMany(quizzesWithVideo, { session });
    }

    // 12) حذف quizzes
    if (
      Array.isArray(req.body.deleteQuizzes) &&
      req.body.deleteQuizzes.length > 0
    ) {
      const quizzesToDelete = await Quiz.find({
        _id: { $in: req.body.deleteQuizzes },
        videoId: video._id,
      }).session(session);

      if (quizzesToDelete.length !== req.body.deleteQuizzes.length) {
        throw new ApiError(
          "Some quiz IDs provided do not exist or do not belong to this video",
          400
        );
      }

      quizzesToDelete.forEach((qz) => {
        if (qz.image)
          filesToDeleteAfterCommit.push(
            path.join(__dirname, "..", "..", "uploads", "quizzes", qz.image)
          );
      });

      await Quiz.deleteMany({
        _id: { $in: req.body.deleteQuizzes },
        videoId: video._id,
      }).session(session);
    }

    // 13) commit
    await session.commitTransaction();
    session.endSession();

    // 14) حذف الملفات القديمة بعد الـ commit
    await Promise.all(
      oldFilesToDelete.map(async (filePath) => {
        try {
          if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
        } catch (err) {
          console.error(
            `Failed to delete old file ${filePath}: ${err.message}`
          );
        }
      })
    );

    await Promise.all(
      filesToDeleteAfterCommit.map(async (filePath) => {
        try {
          if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete file ${filePath}: ${err.message}`);
        }
      })
    );

    // 15) جلب الفيديو النهائي
    const finalVideo = await Video.findById(video._id)
      .populate("flashCards")
      .populate("quizzes");

    let subtitleEnJSON = null;
    let subtitleArJSON = null;

    try {
      if (finalVideo.subtitleEn) {
        const videoSubtitleEnPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "subtitles",
          finalVideo.subtitleEn
        );
        if (fs.existsSync(videoSubtitleEnPath))
          subtitleEnJSON = parseSubtitleFile(videoSubtitleEnPath);
      }
    } catch (err) {
      console.warn("Failed to parse subtitleEn:", err.message);
    }

    try {
      if (finalVideo.subtitleAr) {
        const videoSubtitleArPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "subtitles",
          finalVideo.subtitleAr
        );
        if (fs.existsSync(videoSubtitleArPath))
          subtitleArJSON = parseSubtitleFile(videoSubtitleArPath);
      }
    } catch (err) {
      console.warn("Failed to parse subtitleAr:", err.message);
    }

    return res.status(200).json({
      data: finalVideo,
      subtitleEnJSON,
      subtitleArJSON,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // حذف الملفات الجديدة اللي اترفعت لكن فشلنا
    await Promise.all(
      uploadedFiles.map(async (filePath) => {
        try {
          if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
        } catch (error) {
          console.error(
            `Failed to delete uploaded file ${filePath}: ${error.message}`
          );
        }
      })
    );

    return next(err);
  }
});

exports.deleteVideo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const video = await Video.findById(id).session(session);

    if (!video) {
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(`No video for this id ${id}`, 404));
    }

    // حذف الفيديو نفسه
    await Video.findByIdAndDelete(id).session(session);

    // حذف ملفات الفيديو والصورة
    if (video.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/videosImages/${video.image}`
      );
      if (fs.existsSync(oldImagePath)) await fs.promises.unlink(oldImagePath);
    }
    if (video.video) {
      const oldVideoPath = path.join(
        __dirname,
        `../../uploads/videos/${video.video}`
      );
      if (fs.existsSync(oldVideoPath)) await fs.promises.unlink(oldVideoPath);
    }

    // حذف FlashCards المرتبطة بالفيديو
    const flashcards = await FlashCard.find({ videoId: id }).session(session);
    await Promise.all(
      flashcards.map(async (card) => {
        if (card.image) {
          const imagePath = path.join(
            __dirname,
            `../../uploads/flashCards/${card.image}`
          );
          if (fs.existsSync(imagePath)) await fs.promises.unlink(imagePath);
        }
        await FlashCard.findByIdAndDelete(card._id).session(session);
      })
    );

    // حذف Quizzes المرتبطة بالفيديو
    const quizzes = await Quiz.find({ videoId: id }).session(session);
    await Promise.all(
      quizzes.map(async (quiz) => {
        if (quiz.image) {
          const imagePath = path.join(
            __dirname,
            `../../uploads/quizzes/${quiz.image}`
          );
          if (fs.existsSync(imagePath)) await fs.promises.unlink(imagePath);
        }
        await Quiz.findByIdAndDelete(quiz._id).session(session);
      })
    );

    await session.commitTransaction();
    session.endSession();
    res.status(204).send();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});
