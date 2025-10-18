const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const fs = require("fs");
const { path } = require("path");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Playlist = require("../models/playlistModel");
const Episode = require("../models/episodeModel");
const Video = require("../models/videoModel");
const FlashCard = require("../models/flashCardModel");
const Quiz = require("../models/quizModel");
const addToGarbage = require("../utils/addToGarbage");

// دالة تتحقق من وجود الملف (Asynchronous)
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// @desc    Create episode
// @route    POST /api/v1/episodes
// @access    Private
exports.createEpisode = asyncHandler(async (req, res, next) => {
  const playlistId = req.body.playlistId;
  const seasonNumber = +req.body.seasonNumber;
  const episodeNumber = +req.body.episodeNumber;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if playlist exists
    const playlist = await Playlist.findById(playlistId).session(session);
    if (!playlist) {
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(`Playlist not found`, 404));
    }

    if (playlist.type === "movie") {
      await session.abortTransaction();
      session.endSession();
      return next(
        new ApiError(`Episodes cannot be created for a movie playlist`, 400)
      );
    }

    // Check if season exists in the playlist
    const currentSeason = playlist.seasons.find(
      (season) => season.seasonNumber === seasonNumber
    );

    if (!currentSeason) {
      await session.abortTransaction();
      session.endSession();
      return next(
        new ApiError("", 404, [
          {
            path: "seasonNumber",
            msg: `Season ${seasonNumber} not found in this playlist`,
          },
        ])
      );
    }

    // Check if episode with same number already exists
    const existingEpisode = await Episode.findOne({
      playlistId,
      seasonNumber,
      episodeNumber,
    }).session(session);

    if (existingEpisode) {
      await session.abortTransaction();
      session.endSession();
      return next(
        new ApiError(
          `Episode ${episodeNumber} already exists in season ${seasonNumber}`,
          400
        )
      );
    }

    // Create new episode
    const episode = await Episode.create([{ ...req.body }], { session });

    // Increase the number of episodes in the matched season inside the playlist
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: playlistId, "seasons.seasonNumber": seasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": 1 } },
      { new: true, session }
    );

    const updatedSeason = updatedPlaylist.seasons.find(
      (s) => s.seasonNumber === seasonNumber
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      episode: episode[0],
      seasonNumber: updatedSeason.seasonNumber,
      countOfEpisodes: updatedSeason.countOfEpisodes,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

// @desc    Get list of episodes
// @route    GET /api/v1/episodes
// @access    Private
exports.getEpisodes = factory.getAll(Episode, "Episodes");

// @desc    Get specific episode by id
// @route    GET /api/v1/episodes/:id
// @access    Private
exports.getEpisode = factory.getOne(Episode);

// @desc    Update specific episode
// @route    PUT /api/v1/episodes/:id
// @access    Private
exports.updateEpisode = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, episodeNumber, playlistId, seasonNumber } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1- Fetch the original episode
    const episode = await Episode.findById(id).session(session);
    if (!episode) throw new ApiError("Episode not found", 404);

    const oldPlaylistId = episode.playlistId.toString();
    const oldSeasonNumber = episode.seasonNumber;

    const targetPlaylistId = playlistId || oldPlaylistId;
    const targetSeasonNumber = +seasonNumber || oldSeasonNumber;
    const targetEpisodeNumber = +episodeNumber || episode.episodeNumber;

    const playlist = await Playlist.findById(targetPlaylistId).session(session);
    if (!playlist) throw new ApiError("Playlist not found", 404);

    if (playlist.type === "movie") {
      throw new ApiError("", 400, [
        {
          path: "playlistId",
          msg: `Episodes cannot be associated with a movie playlist`,
        },
      ]);
    }

    const targetSeason = playlist.seasons.find(
      (s) => s.seasonNumber === targetSeasonNumber
    );
    if (!targetSeason) {
      throw new ApiError("", 404, [
        {
          path: "seasonNumber",
          msg: `Season ${targetSeasonNumber} not found in this playlist`,
        },
      ]);
    }

    const duplicateEpisode = await Episode.findOne({
      playlistId: targetPlaylistId,
      seasonNumber: targetSeasonNumber,
      episodeNumber: targetEpisodeNumber,
      _id: { $ne: episode._id },
    }).session(session);

    if (duplicateEpisode) {
      throw new ApiError(
        `Episode with number ${targetEpisodeNumber} already exists in season ${targetSeasonNumber} of this playlist`,
        400
      );
    }

    // ✅ تحديث عدادات المواسم لو اتغيرت
    if (playlistId && playlistId !== oldPlaylistId) {
      await Playlist.updateOne(
        { _id: oldPlaylistId, "seasons.seasonNumber": oldSeasonNumber },
        { $inc: { "seasons.$.countOfEpisodes": -1 } }
      ).session(session);

      await Playlist.updateOne(
        { _id: targetPlaylistId, "seasons.seasonNumber": targetSeasonNumber },
        { $inc: { "seasons.$.countOfEpisodes": 1 } }
      ).session(session);
    } else if (seasonNumber && seasonNumber !== oldSeasonNumber) {
      await Playlist.updateOne(
        { _id: oldPlaylistId, "seasons.seasonNumber": oldSeasonNumber },
        { $inc: { "seasons.$.countOfEpisodes": -1 } }
      ).session(session);

      await Playlist.updateOne(
        { _id: oldPlaylistId, "seasons.seasonNumber": targetSeasonNumber },
        { $inc: { "seasons.$.countOfEpisodes": 1 } }
      ).session(session);
    }

    // ✅ تحديث بيانات الحلقة
    if (title !== undefined) episode.title = title;
    if (episodeNumber !== undefined) episode.episodeNumber = episodeNumber;
    if (playlistId !== undefined) episode.playlistId = playlistId;
    if (seasonNumber !== undefined) episode.seasonNumber = seasonNumber;

    await episode.save({ session });

    // ✅ تحديث الفيديوهات التابعة لو الـ playlistId أو seasonNumber اتغيروا
    if (
      (playlistId && playlistId !== oldPlaylistId) ||
      (seasonNumber && +seasonNumber !== oldSeasonNumber)
    ) {
      await Video.updateMany(
        { episodeId: episode._id },
        {
          $set: {
            ...(playlistId && { playlistId }),
            ...(seasonNumber && { seasonNumber: +seasonNumber }),
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Episode updated successfully",
      episode,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});

// @desc    Delete specific episode
// @route   DELETE /api/v1/episodes/:id
// @access  Private
exports.deleteEpisode = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  const deletedFiles = [];

  try {
    // 1️⃣ جلب الحلقة
    const episode = await Episode.findById(id).session(session);
    if (!episode) throw new ApiError(`No episode found for id ${id}`, 404);

    // 2️⃣ جلب كل الفيديوهات التابعة للحلقة
    const videos = await Video.find({ episodeId: id }).session(session);

    // 3️⃣ التعامل مع كل فيديوهات الحلقة (FlashCards + Quizzes + Files)
    await Promise.all(
      videos.map(async (video) => {
        // ✅ حذف الفلاش كاردز
        const flashCards = await FlashCard.find({ videoId: video._id }).session(
          session
        );

        await Promise.all(
          flashCards.map(async (fc) => {
            if (fc.image) {
              const imagePath = path.join(
                __dirname,
                `../../uploads/flashCards/${fc.image}`
              );
              if (await fileExists(imagePath)) deletedFiles.push(imagePath);
            }
            await FlashCard.deleteOne({ _id: fc._id }).session(session);
          })
        );

        // ✅ حذف الكويزز
        const quizzes = await Quiz.find({ videoId: video._id }).session(
          session
        );

        await Promise.all(
          quizzes.map(async (qz) => {
            if (qz.image) {
              const imagePath = path.join(
                __dirname,
                `../../uploads/quizzes/${qz.image}`
              );
              if (await fileExists(imagePath)) deletedFiles.push(imagePath);
            }
            await Quiz.deleteOne({ _id: qz._id }).session(session);
          })
        );

        // ✅ تسجيل ملفات الفيديو (video, image, subtitles)
        const videoPaths = [
          video.video &&
            path.join(__dirname, `../../uploads/videos/${video.video}`),
          video.image &&
            path.join(__dirname, `../../uploads/videosImages/${video.image}`),
          video.subtitleEn &&
            path.join(__dirname, `../../uploads/subtitles/${video.subtitleEn}`),
          video.subtitleAr &&
            path.join(__dirname, `../../uploads/subtitles/${video.subtitleAr}`),
        ].filter(Boolean);

        await Promise.all(
          videoPaths.map(async (filePath) => {
            if (await fileExists(filePath)) deletedFiles.push(filePath);
          })
        );

        // ✅ حذف الفيديو نفسه
        await Video.deleteOne({ _id: video._id }).session(session);
      })
    );

    // 4️⃣ تقليل عدد الحلقات في السيزون بالبلاي ليست
    await Playlist.updateOne(
      {
        _id: episode.playlistId,
        "seasons.seasonNumber": episode.seasonNumber,
      },
      { $inc: { "seasons.$.countOfEpisodes": -1 } }
    ).session(session);

    // 5️⃣ حذف الحلقة نفسها
    await Episode.deleteOne({ _id: id }).session(session);

    // 6️⃣ تسجيل الملفات في الـ Garbage
    if (deletedFiles.length > 0) {
      await addToGarbage(
        deletedFiles,
        `Episode #${episode._id} and all related videos, flashcards, and quizzes deleted`,
        session
      );
    }

    // 7️⃣ إنهاء المعاملة
    await session.commitTransaction();
    session.endSession();

    res.status(204).send();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(err);
  }
});
