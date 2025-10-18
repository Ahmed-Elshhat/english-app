const Garbage = require("../models/garbageModel");

async function addToGarbage(
  filePaths,
  reason = "Scheduled for deletion",
  session = null
) {
  if (!Array.isArray(filePaths)) filePaths = [filePaths];

  const garbageDocs = filePaths.map((path) => ({
    filePath: path,
    reason,
  }));

  if (session) {
    await Garbage.insertMany(garbageDocs, { session });
  } else {
    await Garbage.insertMany(garbageDocs);
  }
}

module.exports = addToGarbage;
