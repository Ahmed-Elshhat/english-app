const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const parser = require("subtitles-parser");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

function parseSubtitleFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return parser.fromSrt(content, true);
}

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (req?.user?.id) {
      if (String(req?.user?.id) === id && req?.user?.role === "admin") {
        return next(new ApiError("not allowed delete your account", 403));
      }
    }
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updateOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // If true , returns the updated document And if false returns the original document
    ).select("-password -accessToken");

    if (populationOpt) {
      query = query.populate({ path: populationOpt, select: "-__v" });
    }

    const document = await query;
    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  });

exports.createOne = (Model, modelName) =>
  asyncHandler(async (req, res) => {
    const body = {
      ...req.body,
    };
    if (modelName === "Users") {
      if (body.role === "admin") {
        body.points = undefined;
      } else {
        body.points = body.points ?? 5;
      }
    }

    const newDoc = await Model.create(body);

    const documentObject = newDoc.toObject();

    delete documentObject.accessToken;
    delete documentObject.password;
    delete documentObject.__v;

    res.status(201).json({ data: documentObject });
  });

exports.getOne = (Model, modelName, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    // let query = Model.findOne({
    //   _id: id,
    // });

    if (populationOpt) {
      if (Array.isArray(populationOpt)) {
        query = query.populate(
          populationOpt.map((field) => ({ path: field, select: "-__v" }))
        );
      } else {
        query = query.populate({ path: populationOpt, select: "-__v" });
      }
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    let subtitleEnJSON = null;
    let subtitleArJSON = null;
    if (modelName === "Videos") {
      try {
        if (document.subtitleEn) {
          const videoSubtitleEnPath = path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            "subtitles",
            document.subtitleEn
          );
          if (fs.existsSync(videoSubtitleEnPath))
            subtitleEnJSON = parseSubtitleFile(videoSubtitleEnPath);
        }
      } catch (err) {
        console.warn("Failed to parse subtitleEn:", err.message);
      }

      try {
        if (document.subtitleAr) {
          const videoSubtitleArPath = path.join(
            __dirname,
            "..",
            "..",
            "uploads",
            "subtitles",
            document.subtitleAr
          );
          if (fs.existsSync(videoSubtitleArPath))
            subtitleArJSON = parseSubtitleFile(videoSubtitleArPath);
        }
      } catch (err) {
        console.warn("Failed to parse subtitleAr:", err.message);
      }
    }

    const documentObject = document.toObject();

    delete documentObject.accessToken;
    delete documentObject.password;
    delete documentObject.__v;

    res.status(200).json({
      data: documentObject,
      ...(subtitleEnJSON ? { subtitleEnJSON } : {}),
      ...(subtitleArJSON ? { subtitleArJSON } : {}),
    });

    /* 
      1. استخدم lean() لتحسين الأداء في الـ query

      بدل:

      let query = Model.findById(id);


      خليها:

      let query = Model.findById(id).lean();


      ده بيرجع object عادي بدل document من Mongoose، فمش هتحتاج:

      const documentObject = document.toObject();


      وهيخلي الكود أسرع وأخف في الذاكرة.
    */

    /* 
      2. استخدم دالة omit لتقليل الحذف اليدوي

      بدل ما تعمل:

      delete documentObject.accessToken;
      delete documentObject.password;
      delete documentObject.__v;


      تقدر تستخدم مكتبة زي lodash (لو بتستخدمها أصلًا):

      const documentObject = _.omit(document, ['accessToken', 'password', '__v']);


      ده أنظف وأوضح.
    */
  });

exports.getAll = (Model, searchKeyWord, populationOpt) =>
  asyncHandler(async (req, res) => {
    const needsFilter = [].includes(searchKeyWord);
    const filterObj = needsFilter ? req.filterObj : {};

    let apiFeatures = new ApiFeatures(Model.find(filterObj), req.query)
      .filter()
      .search(searchKeyWord)
      .limitFields("-password -accessToken")
      .sort();

    const filteredCount = await apiFeatures.mongooseQuery
      .clone()
      .countDocuments();
    apiFeatures.Paginate(filteredCount);
    if (populationOpt) {
      if (Array.isArray(populationOpt)) {
        apiFeatures.mongooseQuery = apiFeatures.mongooseQuery.populate(
          populationOpt.map((field) => ({ path: field, select: "-__v" }))
        );
      } else {
        apiFeatures.mongooseQuery = apiFeatures.mongooseQuery.populate({
          path: populationOpt,
          select: "-__v",
        });
      }
    }

    // 6) Execute query
    const { mongooseQuery, paginationResults } = apiFeatures;
    const documents = await mongooseQuery;
    res
      .status(200)
      .json({ results: documents.length, paginationResults, data: documents });
  });
