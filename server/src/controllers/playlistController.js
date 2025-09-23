const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Playlist = require("../models/playlistModel");
const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlersFactory");

exports.uploadPlaylistImage = uploadSingleImage("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `playlist-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 100 })
      .toFile(`uploads/playlists/${fileName}`);

    // Save image into our db
    req.body.image = fileName;
  }
  next();
});

exports.parseJSON = asyncHandler(async (req, res, next) => {
  let seasons = req.body.seasons;
  let excludeIds = req.body.excludeIds;

  if (seasons != null && seasons !== "" && !Array.isArray(req.body.seasons)) {
    try {
      req.body.seasons = JSON.parse(req.body.seasons); // Convert sizes from string to JSON
    } catch (error) {
      // step 3: If conversion fails, return an error stating that the sizes format is invalid
      return next(new ApiError("Invalid seasons format.", 400));
    }
  }

  if (excludeIds != null && excludeIds !== "" && !Array.isArray(req.body.excludeIds)) {
    try {
      req.body.excludeIds = JSON.parse(req.body.excludeIds); // Convert sizes from string to JSON
    } catch (error) {
      // step 3: If conversion fails, return an error stating that the sizes format is invalid
      return next(new ApiError("Invalid exclude Ids format.", 400));
    }
  }
  next();
});

exports.createPlaylist = factory.createOne(Playlist);

exports.getPlaylists = factory.getAll(Playlist, "Playlists");

exports.getPlaylist = factory.getOne(Playlist);

exports.getRandomPlaylists = asyncHandler(async (req, res, next) => {
  const { playlistsSize, playlistsType } = req.query;
  const { excludeIds = [] } = req.body;

  const playlists = await Playlist.aggregate([
    {
      $match: {
        type: playlistsType,
        _id: {
          $nin: excludeIds.map((id) => new mongoose.Types.ObjectId(String(id))),
        },
      },
    },
    { $sample: { size: +playlistsSize || 20 } },
  ]);

  res.status(200).json({ data: playlists });
});

exports.updatePlaylist = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) هات الـ playlist القديم
    const oldPlaylist = await Playlist.findById(req.params.id).session(session);
    if (!oldPlaylist) {
      await session.abortTransaction();
      session.endSession();
      return next(
        new ApiError(`No playlist for this id ${req.params.id}`, 404)
      );
    }

    // 2) اعمل تحديث للـ playlist
    const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      session,
    });

    // 3) لو فيه صورة جديدة ومختلفة → احذف القديمة
    if (req.body.image && req.body.image !== oldPlaylist.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/playlists/${oldPlaylist.image}`
      );

      try {
        await fs.promises.unlink(oldImagePath);
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return next(
          new ApiError(
            "Playlist update failed because the old image could not be deleted.",
            500
          )
        );
      }
    }

    // 4) كل حاجة نجحت → commit
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ data: playlist });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

exports.deletePlaylist = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) هات الـ playlist
    const playlist = await Playlist.findById(id).session(session);
    if (!playlist) {
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(`No playlist for this id ${id}`, 404));
    }

    // 2) احذف الـ playlist
    await Playlist.findByIdAndDelete(id).session(session);

    // 3) لو فيه صورة امسحها
    if (playlist.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/playlists/${playlist.image}`
      );

      console.log(oldImagePath);
      try {
        await fs.promises.unlink(oldImagePath);
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return next(
          new ApiError(
            "Playlist deletion failed because the image could not be deleted.",
            500
          )
        );
      }
    }

    // 4) لو كل حاجة تمام اعمل commit
    await session.commitTransaction();
    session.endSession();

    res.status(204).send();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});
