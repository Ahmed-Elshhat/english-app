const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Playlist = require("../models/playlistModel");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

exports.uploadPlaylistImage = uploadSingleImage("image");

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

// ---------------------- CRUD OPERATIONS ----------------------

// Create a new playlist
exports.createPlaylist = factory.createOne(Playlist);

// Get all playlists (with filters, pagination, etc.)
exports.getPlaylists = factory.getAll(Playlist, "Playlists");

// Get a single playlist by ID
exports.getPlaylist = factory.getOne(Playlist);

/**
 * Get random playlists based on type and excluding certain IDs.
 * - playlistsType (series/movie) is required
 * - playlistsSize defines how many to fetch (default 20)
 * - excludeIds ensures no duplicates from client cache
 */
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

/**
 * Update a playlist by ID
 * - Uses transaction to ensure atomicity
 * - If a new image is uploaded, deletes the old one
 */
exports.updatePlaylist = asyncHandler(async (req, res, next) => {
  // Step 1: Start session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 2: Get current playlist inside session
    const oldPlaylist = await Playlist.findById(req.params.id).session(session);

    if (!oldPlaylist) {
      // Playlist not found -> abort and return 404
      await session.abortTransaction();
      session.endSession();
      return next(
        new ApiError(`No playlist for this id ${req.params.id}`, 404)
      );
    }

    // Step 3: Update playlist (inside session)
    const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      session,
    });

    // Step 4: If a new image is provided and differs from the old one, delete the old file
    if (req.body.image && req.body.image !== oldPlaylist.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/playlists/${oldPlaylist.image}`
      );

      try {
        // Attempt to remove the old image from disk
        await fs.promises.unlink(oldImagePath);
      } catch (err) {
        // Image removal failed -> abort transaction and return 500
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

    // Step 5: All operations succeeded -> commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Step 6: Return updated resource
    res.status(200).json({ data: playlist });
  } catch (error) {
    // Step 7: On error -> abort and forward
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

/**
 * Delete a playlist by ID
 * - Uses transaction for safe deletion
 * - Also deletes associated image file if it exists
 */
exports.deletePlaylist = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Step 1: Start session & transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 2: Get playlist inside session
    const playlist = await Playlist.findById(id).session(session);

    if (!playlist) {
      // Not found -> abort & return 404
      await session.abortTransaction();
      session.endSession();
      return next(new ApiError(`No playlist for this id ${id}`, 404));
    }

    // Step 3: Delete the playlist document
    await Playlist.findByIdAndDelete(id).session(session);

    // Step 4: If there is an image, attempt to delete the file from disk
    if (playlist.image) {
      const oldImagePath = path.join(
        __dirname,
        `../../uploads/playlists/${playlist.image}`
      );

      try {
        await fs.promises.unlink(oldImagePath);
      } catch (err) {
        // File deletion failed -> abort & return 500
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
