const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Playlist = require("../models/playlistModel");
const Episode = require("../models/episodeModel");

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

exports.getEpisodes = factory.getAll(Episode, "Episodes");

exports.getEpisode = factory.getOne(Episode);

exports.updateEpisode = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, episodeNumber, playlistId, seasonNumber } = req.body;

  // 1- Fetch the original episode
  const episode = await Episode.findById(id);
  if (!episode) {
    return next(new ApiError("Episode not found", 404));
  }

  const oldPlaylistId = episode.playlistId.toString();
  const oldSeasonNumber = episode.seasonNumber;

  // Use new values if provided, otherwise keep the old ones
  const targetPlaylistId = playlistId || oldPlaylistId;
  const targetSeasonNumber = +seasonNumber || oldSeasonNumber;
  const targetEpisodeNumber = +episodeNumber || episode.episodeNumber;

  // 2- Ensure the target playlist exists
  const playlist = await Playlist.findById(targetPlaylistId);
  if (!playlist) {
    return next(new ApiError("Playlist not found", 404));
  }

  // 3- Prevent linking an episode to a movie playlist
  if (playlist.type === "movie") {
    return next(
      new ApiError("", 400, [
        {
          path: "playlistId",
          msg: `Episodes cannot be associated with a movie playlist`,
        },
      ])
    );
  }

  // 4- Ensure the target season exists in the playlist
  const targetSeason = playlist.seasons.find(
    (s) => s.seasonNumber === targetSeasonNumber
  );
  if (!targetSeason) {
    return next(
      new ApiError("", 404, [
        {
          path: "seasonNumber",
          msg: `Season ${targetSeasonNumber} not found in this playlist`,
        },
      ])
    );
  }

  // 5- Check for duplicate episode with the same playlistId, seasonNumber, and episodeNumber
  const duplicateEpisode = await Episode.findOne({
    playlistId: targetPlaylistId,
    seasonNumber: targetSeasonNumber,
    episodeNumber: targetEpisodeNumber,
    _id: { $ne: episode._id }, // Exclude the current episode
  });

  if (duplicateEpisode) {
    return next(
      new ApiError(
        `Episode with number ${targetEpisodeNumber} already exists in season ${targetSeasonNumber} of this playlist`,
        400
      )
    );
  }

  // 6- Update counters if playlist or season changed
  if (playlistId && playlistId !== oldPlaylistId) {
    // Case 1: Playlist changed → decrement count in old season
    await Playlist.updateOne(
      { _id: oldPlaylistId, "seasons.seasonNumber": oldSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": -1 } }
    );

    // Increment count in new season
    await Playlist.updateOne(
      { _id: targetPlaylistId, "seasons.seasonNumber": targetSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": 1 } }
    );
  } else if (seasonNumber && seasonNumber !== oldSeasonNumber) {
    // Case 2: Same playlist but season changed
    // Decrement old season
    await Playlist.updateOne(
      { _id: oldPlaylistId, "seasons.seasonNumber": oldSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": -1 } }
    );

    // Increment new season
    await Playlist.updateOne(
      { _id: oldPlaylistId, "seasons.seasonNumber": targetSeasonNumber },
      { $inc: { "seasons.$.countOfEpisodes": 1 } }
    );
  }

  // 7- Update episode fields if provided
  if (title !== undefined) episode.title = title;
  if (episodeNumber !== undefined) episode.episodeNumber = episodeNumber;
  if (playlistId !== undefined) episode.playlistId = playlistId;
  if (seasonNumber !== undefined) episode.seasonNumber = seasonNumber;

  // Save changes
  await episode.save();

  // Send success response
  res.status(200).json({
    message: "Episode updated successfully",
    episode,
  });
});

exports.deleteEpisode = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // 1- Find the episode by ID
  const episode = await Episode.findById(id);
  if (!episode) {
    return next(new ApiError(`No episode for this id ${id}`, 404));
  }

  // 3- Decrement the episode count in the corresponding playlist season
  //    - Match the playlist by playlistId
  //    - Match the correct season by seasonNumber
  //    - Use $inc to decrease the countOfEpisodes by 1
  await Playlist.updateOne(
    { _id: episode.playlistId, "seasons.seasonNumber": episode.seasonNumber },
    { $inc: { "seasons.$.countOfEpisodes": -1 } }
  );

  // 4- Delete the episode from the database
  await Episode.deleteOne({ _id: id });

  res.status(204).send();
});
