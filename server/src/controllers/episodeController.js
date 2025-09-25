const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Playlist = require("../models/playlistModel");
const Episode = require("../models/episodeModel");

exports.createEpisode = asyncHandler(async (req, res, next) => {
  const { episodeNumber, playlistId, seasonNumber } = req.body;

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
        new ApiError(`Season ${seasonNumber} not found in this playlist`, 404)
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

exports.getEpisodes = factory.getAll(Episode, "Episodes");

exports.getEpisode = factory.getOne(Episode);

exports.updateEpisode = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, episodeNumber, playlistId, seasonNumber } = req.body;

  // 1- نجيب الحلقة الأصلية
  const episode = await Episode.findById(id);
  if (!episode) {
    return next(new ApiError("Episode not found", 404));
  }

  const oldPlaylistId = episode.playlistId.toString();
  const oldSeasonNumber = episode.seasonNumber;

  const targetPlaylistId = playlistId || oldPlaylistId;
  const targetSeasonNumber = seasonNumber || oldSeasonNumber;
  const targetEpisodeNumber = episodeNumber || episode.episodeNumber;

  // 2- نتأكد إن الـ playlist الجديدة (أو الحالية) موجودة
  const playlist = await Playlist.findById(targetPlaylistId);
  if (!playlist) {
    return next(new ApiError("Playlist not found", 404));
  }

  // 3- لو playlist فيلم → خطأ
  if (playlist.type === "movie") {
    return next(
      new ApiError("Episodes cannot be associated with a movie playlist", 400)
    );
  }

  // 4- نتأكد إن الـ season موجودة في الـ playlist
  const targetSeason = playlist.seasons.find(
    (s) => s.seasonNumber === targetSeasonNumber
  );
  if (!targetSeason) {
    return next(
      new ApiError(
        `Season ${targetSeasonNumber} not found in this playlist`,
        404
      )
    );
  }

  // 5- نشيك لو فيه حلقة بنفس (playlistId, seasonNumber, episodeNumber)
  const duplicateEpisode = await Episode.findOne({
    playlistId: targetPlaylistId,
    seasonNumber: targetSeasonNumber,
    episodeNumber: targetEpisodeNumber,
    _id: { $ne: episode._id }, // نستثني الحلقة الحالية
  });

  if (duplicateEpisode) {
    return next(
      new ApiError(
        `Episode with number ${targetEpisodeNumber} already exists in season ${targetSeasonNumber} of this playlist`,
        400
      )
    );
  }

  // 6- تحديث العدادات لو اتغير الـ playlist أو الـ season
  if (playlistId && playlistId !== oldPlaylistId) {
    // خصم 1 من الـ season القديمة في الـ playlist القديمة
    await Playlist.updateOne(
      { _id: oldPlaylistId, "seasons.seasonNumber": oldSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": -1 } }
    );

    // إضافة 1 للـ season الجديدة في الـ playlist الجديدة
    await Playlist.updateOne(
      { _id: targetPlaylistId, "seasons.seasonNumber": targetSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": 1 } }
    );
  } else if (seasonNumber && seasonNumber !== oldSeasonNumber) {
    // نفس الـ playlist لكن season مختلفة
    await Playlist.updateOne(
      { _id: oldPlaylistId, "seasons.seasonNumber": oldSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": -1 } }
    );

    await Playlist.updateOne(
      { _id: oldPlaylistId, "seasons.seasonNumber": targetSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": 1 } }
    );
  }

  // 7- نحدث الحقول المطلوبة
  if (title !== undefined) episode.title = title;
  if (episodeNumber !== undefined) episode.episodeNumber = episodeNumber;
  if (playlistId !== undefined) episode.playlistId = playlistId;
  if (seasonNumber !== undefined) episode.seasonNumber = seasonNumber;

  await episode.save();

  res.status(200).json({
    message: "Episode updated successfully",
    episode,
  });
});
