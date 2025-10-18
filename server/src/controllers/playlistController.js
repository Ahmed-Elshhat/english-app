const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Playlist = require("../models/playlistModel");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const { uploadSingleFile } = require("../middlewares/uploadImageMiddleware");
const addToGarbage = require("../utils/addToGarbage");
const Video = require("../models/videoModel");
const Quiz = require("../models/quizModel");
const FlashCard = require("../models/flashCardModel");
const Episode = require("../models/episodeModel");

exports.uploadPlaylistImage = uploadSingleFile("image");

// ---------------------- IMAGE PROCESSING ----------------------

/**
 * Resize and format uploaded playlist image before saving.
 * - Resizes to 600x600 px
 * - Converts to JPEG with high quality
 * - Stores file in uploads/playlists/
 * - Attaches filename to req.body for DB persistence
 */
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Step 1: Create a unique filename for the uploaded image
  const fileName = `playlist-${uuidv4()}-${Date.now()}.jpeg`;

  // Step 2: If an image file was uploaded, resize & save it
  if (req.file) {
    // Process buffer -> resize -> convert -> save file
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`uploads/playlists/${fileName}`);

    // Step 3: Attach filename to req.body so create/update controller can save it to DB
    req.body.image = fileName; // Save filename for DB
  }

  // Step 4: Continue
  next();
});

// ---------------------- JSON PARSING ----------------------

/**
 * Middleware to parse JSON strings (if passed as text instead of array).
 * - Parses "seasons" and "excludeIds" if they are valid JSON
 * - Returns 400 error if parsing fails
 */
exports.parseJSON = asyncHandler(async (req, res, next) => {
  let seasons = req.body.seasons;
  let excludeIds = req.body.excludeIds;

  // Step 2: Parse seasons if needed
  if (seasons != null && seasons !== "" && !Array.isArray(req.body.seasons)) {
    try {
      // Convert JSON string to array/object
      req.body.seasons = JSON.parse(req.body.seasons);
    } catch (error) {
      // Bad format -> return 400
      return next(new ApiError("Invalid seasons format.", 400));
    }
  }

  // Step 3: Parse excludeIds if needed
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

// ---------------------- CRUD OPERATIONS ----------------------

// @desc    Create playlist
// @route    POST /api/v1/playlists
// @access    Private
exports.createPlaylist = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const { image } = req.body;
  let imagePath = null;

  try {
    if (image) {
      imagePath = path.join(__dirname, "../../uploads/playlists", image);
      const exists = await fileExists(imagePath);
      if (!exists) throw new ApiError("Uploaded playlist image not found", 404);
    }

    const playlist = await Playlist.create([req.body], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ data: playlist[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // ⚠️ لو حصل خطأ والصورة كانت مرفوعة فعلاً → نحطها في الـ garbage
    if (imagePath && (await fileExists(imagePath))) {
      await addToGarbage(
        imagePath,
        "Playlist creation failed, image moved to garbage"
      );
    }

    return next(error);
  }
});

// @desc    Get list of playlist
// @route    GET /api/v1/playlist
// @access    Private
exports.getPlaylists = factory.getAll(Playlist, "Playlists");

// @desc    Get specific playlist by id
// @route    GET /api/v1/playlists/:id
// @access    Private
exports.getPlaylist = factory.getOne(Playlist);

// @desc    Get list of random playlists
// @route    POST /api/v1/playlists/random
// @access    protect
exports.getRandomPlaylists = asyncHandler(async (req, res) => {
  const { playlistsType, playlistsSize } = req.query;
  const { excludeIds = [] } = req.body;

  const objectIds = excludeIds.map(
    (id) => new mongoose.Types.ObjectId(String(id))
  );

  // 1 - Count how many playlists are left after excluding the given IDs
  const totalCount = await Playlist.countDocuments({
    type: playlistsType,
    _id: { $nin: objectIds },
  });

  // 2 - Calculate the remaining count after this fetch (never negative)
  const remainingCount = Math.max(totalCount - (+playlistsSize || 20), 0);

  // 3 - Fetch a random batch of playlists (limited by playlistsSize)
  const playlists = await Playlist.aggregate([
    {
      $match: {
        type: playlistsType,
        _id: { $nin: objectIds },
      },
    },
    { $sample: { size: +playlistsSize || 20 } },
  ]);

  // 4 - Format playlist documents (add absolute image URL if exists)
  const formatted = playlists.map((p) => ({
    ...p,
    imageUrl: p.image ? `${process.env.BASE_URL}/playlists/${p.image}` : null,
  }));

  // 5 - Calculate how many pages are left based on the remaining count
  const remainingPages = Math.ceil(remainingCount / (+playlistsSize || 20));

  res.status(200).json({
    results: playlists.length,
    total: remainingCount,
    remainingPages,
    playlists: formatted,
  });
});

// @desc    Update specific playlist
// @route   PUT /api/v1/playlists/:id
// @access  Private
exports.updatePlaylist = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const newImage = req.body.image;
  let newImagePath = null;
  const deletedFiles = [];

  try {
    // ✅ لو فيه صورة جديدة، تحقق إنها موجودة فعلاً
    if (newImage) {
      newImagePath = path.join(__dirname, "../../uploads/playlists", newImage);
      const exists = await fileExists(newImagePath);
      if (!exists) throw new ApiError("Uploaded playlist image not found", 404);
    }

    const oldPlaylist = await Playlist.findById(req.params.id).session(session);
    if (!oldPlaylist)
      throw new ApiError(`No playlist for this id ${req.params.id}`, 404);

    if (!req.body.seasons) req.body.seasons = oldPlaylist.seasons;

    // ✅ تأكد إن فيه seasons في البودي
    if (Array.isArray(req.body.seasons) && req.body.seasons.length > 0) {
      const oldSeasons = oldPlaylist.seasons || [];

      req.body.seasons = req.body.seasons.map((newSeason) => {
        // لو مفيش _id بس فيه seasonNumber
        if (!newSeason._id && newSeason.seasonNumber) {
          // شوف هل فيه موسم قديم بنفس الرقم
          const existing = oldSeasons.find(
            (old) => old.seasonNumber === newSeason.seasonNumber
          );

          // لو لقيه، ضيف ال _id القديم
          if (existing) {
            return { ...newSeason, _id: existing._id };
          }
        }

        // غير كده، سيبه زي ما هو
        return newSeason;
      });
    }

    const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      session,
    });

    if (req.body.seasons != null && Array.isArray(req.body.seasons)) {
      // ✅ مقارنة المواسم القديمة والجديدة
      const oldSeasons = oldPlaylist.seasons || [];
      const newSeasons = req.body.seasons || [];

      // 🧠 تحديث رقم الموسم لو اتغير
      await Promise.all(
        newSeasons
          .filter(
            (newS) =>
              newS._id &&
              oldSeasons.some(
                (oldS) =>
                  oldS._id?.toString() === newS._id &&
                  oldS.seasonNumber !== newS.seasonNumber
              )
          )
          .map(async (newS) => {
            const matchedOld = oldSeasons.find(
              (oldS) => oldS._id?.toString() === newS._id
            );
            if (matchedOld) {
              await Promise.all([
                Video.updateMany(
                  {
                    playlistId: oldPlaylist._id,
                    seasonNumber: matchedOld.seasonNumber,
                  },
                  { $set: { seasonNumber: newS.seasonNumber } },
                  { session }
                ),
                Episode.updateMany(
                  {
                    playlistId: oldPlaylist._id,
                    seasonNumber: matchedOld.seasonNumber,
                  },
                  { $set: { seasonNumber: newS.seasonNumber } },
                  { session }
                ),
              ]);
            }
          })
      );

      // ❌ المواسم اللي اتحذفت
      const deletedSeasons = oldSeasons.filter(
        (oldS) =>
          !newSeasons.some(
            (newS) =>
              (newS._id && newS._id.toString() === oldS._id.toString()) ||
              newS.seasonNumber === oldS.seasonNumber
          )
      );

      if (deletedSeasons.length > 0) {
        const allDeletedSeasonNumbers = deletedSeasons.map(
          (s) => s.seasonNumber
        );

        const [episodes, videos] = await Promise.all([
          Episode.find({
            playlistId: oldPlaylist._id,
            seasonNumber: { $in: allDeletedSeasonNumbers },
          }).session(session),
          Video.find({
            playlistId: oldPlaylist._id,
            seasonNumber: { $in: allDeletedSeasonNumbers },
          }).session(session),
        ]);

        const episodeIds = episodes.map((e) => e._id);
        const videoIds = videos.map((v) => v._id);

        // 🗂️ اجمع ملفات الفيديوهات
        await Promise.all(
          videos.map(async (v) => {
            const vPaths = [
              v.video && path.join(__dirname, "../../uploads/videos", v.video),
              v.image &&
                path.join(__dirname, "../../uploads/videosImages", v.image),
              v.subtitleAr &&
                path.join(__dirname, "../../uploads/subtitles", v.subtitleAr),
              v.subtitleEn &&
                path.join(__dirname, "../../uploads/subtitles", v.subtitleEn),
            ].filter(Boolean);

            const existsResults = await Promise.all(
              vPaths.map(async (p) => ((await fileExists(p)) ? p : null))
            );
            deletedFiles.push(...existsResults.filter(Boolean));
          })
        );

        // 🧩 FlashCards و Quizzes
        const [flashCards, quizzes] = await Promise.all([
          FlashCard.find({ videoId: { $in: videoIds } }).session(session),
          Quiz.find({ videoId: { $in: videoIds } }).session(session),
        ]);

        await Promise.all([
          ...flashCards.map(async (fc) => {
            const fcPath =
              fc.image &&
              path.join(__dirname, "../../uploads/flashCards", fc.image);
            if (fcPath && (await fileExists(fcPath))) deletedFiles.push(fcPath);
          }),
          ...quizzes.map(async (qz) => {
            const qzPath =
              qz.image &&
              path.join(__dirname, "../../uploads/quizzes", qz.image);
            if (qzPath && (await fileExists(qzPath))) deletedFiles.push(qzPath);
          }),
        ]);

        // 🧹 احذف البيانات فعلياً
        await Promise.all([
          Episode.deleteMany({ _id: { $in: episodeIds } }).session(session),
          Video.deleteMany({ _id: { $in: videoIds } }).session(session),
          FlashCard.deleteMany({ videoId: { $in: videoIds } }).session(session),
          Quiz.deleteMany({ videoId: { $in: videoIds } }).session(session),
        ]);

        if (deletedFiles.length > 0) {
          await addToGarbage(
            deletedFiles,
            `Seasons removed from playlist (${oldPlaylist._id}) and related media deleted`,
            session
          );
        }
      }
    }

    // ✅ لو الصورة اتغيرت، ضيف القديمة للـ garbage
    if (newImage && oldPlaylist.image !== newImage) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads/playlists",
        oldPlaylist.image
      );

      const oldExists = await fileExists(oldImagePath);
      if (oldExists) {
        await addToGarbage(
          oldImagePath,
          `Old playlist image replaced during update (playlistId: ${oldPlaylist._id})`,
          session
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ data: playlist });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // ⚠️ لو حصل خطأ بعد رفع الصورة الجديدة → ضيفها للـ garbage
    if (newImagePath && (await fileExists(newImagePath))) {
      await addToGarbage(
        newImagePath,
        `New playlist image rolled back after failed update (playlistId: ${req.params.id})`
      );
    }

    return next(error);
  }
});

// @desc    Delete specific playlist
// @route   DELETE /api/v1/playlists/:id
// @access  Private
exports.deletePlaylist = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  // 🧮 Counters for stats
  let deletedEpisodesCount = 0;
  let deletedVideosCount = 0;
  let deletedFlashCardsCount = 0;
  let deletedQuizzesCount = 0;

  const deletedFiles = [];

  try {
    const playlist = await Playlist.findById(id).session(session);
    if (!playlist) throw new ApiError(`No playlist for this id ${id}`, 404);

    // === حذف صورة الـ Playlist ===
    if (playlist.image) {
      const imagePath = path.join(
        __dirname,
        `../../uploads/playlists/${playlist.image}`
      );
      if (await fileExists(imagePath)) {
        deletedFiles.push(imagePath);
      }
    }

    // === لو النوع Movie، احذف الفيديوهات فقط ===
    const videos = await Video.find({ playlistId: id }).session(session);

    await Promise.all(
      videos.map(async (video) => {
        deletedVideosCount++;

        const videoPath = video.video
          ? path.join(__dirname, "../../uploads/videos", video.video)
          : null;
        const videoImagePath = video.image
          ? path.join(__dirname, "../../uploads/videosImages", video.image)
          : null;

        const subtitleEnPath = video.subtitleEn
          ? path.join(__dirname, "../../uploads/subtitles", video.subtitleEn)
          : null;

        const subtitleArPath = video.subtitleAr
          ? path.join(__dirname, "../../uploads/subtitles", video.subtitleAr)
          : null;

        if (videoPath && (await fileExists(videoPath)))
          deletedFiles.push(videoPath);
        if (videoImagePath && (await fileExists(videoImagePath)))
          deletedFiles.push(videoImagePath);
        if (subtitleEnPath && (await fileExists(subtitleEnPath)))
          deletedFiles.push(subtitleEnPath);
        if (subtitleArPath && (await fileExists(subtitleArPath)))
          deletedFiles.push(subtitleArPath);

        // حذف flashCards & quizzes التابعة للفيديو
        const flashCards = await FlashCard.find({
          videoId: video._id,
        }).session(session);
        await Promise.all(
          flashCards.map(async (fc) => {
            deletedFlashCardsCount++;
            const fcPath = fc.image
              ? path.join(__dirname, "../../uploads/flashCards", fc.image)
              : null;
            if (fcPath && (await fileExists(fcPath))) deletedFiles.push(fcPath);
            await FlashCard.deleteOne({ _id: fc._id }).session(session);
          })
        );

        const quizzes = await Quiz.find({ videoId: video._id }).session(
          session
        );
        await Promise.all(
          quizzes.map(async (qz) => {
            deletedQuizzesCount++;
            const qzPath = qz.image
              ? path.join(__dirname, "../../uploads/quizzes", qz.image)
              : null;
            if (qzPath && (await fileExists(qzPath))) deletedFiles.push(qzPath);
            await Quiz.deleteOne({ _id: qz._id }).session(session);
          })
        );

        await Video.deleteOne({ _id: video._id }).session(session);
      })
    );

    // === لو Playlist نوعها series احذف كل الحلقات والفيديوهات التابعة ===
    if (playlist.type === "series") {
      const episodes = await Episode.find({ playlistId: id }).session(session);

      await Promise.all(
        episodes.map(async (episode) => {
          deletedEpisodesCount++;
          // حذف الحلقة نفسها
          await Episode.deleteOne({ _id: episode._id }).session(session);
        })
      );

      if (episodes.length > 0)
        console.log(
          `🧩 Deleted ${episodes.length} episodes belonging to playlist ${id}`
        );
    }

    // === حذف الـ Playlist نفسها ===
    await Playlist.deleteOne({ _id: id }).session(session);

    // === إضافة كل الملفات للـ Garbage ===
    if (deletedFiles.length > 0) {
      await addToGarbage(
        deletedFiles,
        `Playlist #${playlist._id} (${playlist.type}) and all related files (videos, flashcards, quizzes, subtitles) moved to garbage for cleanup`,
        session
      );
    }

    // === Log stats ===
    console.log(
      `\n🧹 Playlist #${playlist._id} (${playlist.type}) deleted:\n` +
        `   • Episodes: ${deletedEpisodesCount}\n` +
        `   • Videos: ${deletedVideosCount}\n` +
        `   • Flashcards: ${deletedFlashCardsCount}\n` +
        `   • Quizzes: ${deletedQuizzesCount}\n`
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
