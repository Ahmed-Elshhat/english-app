const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const playlistRoute = require("./playlistRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/playlists", playlistRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
};

module.exports = mountRoutes;
