const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const playlistRoute = require("./playlistRoute");
const episodeRoute = require("./episodeRoute");
const videoRoute = require("./videoRoute");
const flashCardRoute = require("./flashCardRoute");
const quizRoute = require("./quizRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/playlists", playlistRoute);
  app.use("/api/v1/episodes", episodeRoute);
  app.use("/api/v1/videos", videoRoute);
  app.use("/api/v1/flashCards", flashCardRoute);
  app.use("/api/v1/quizzes", quizRoute);
};

module.exports = mountRoutes;
