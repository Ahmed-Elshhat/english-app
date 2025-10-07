const path = require("path");
const fs = require("fs");

const express = require("express");
const dotenv = require("dotenv");
// To Logging API Requests
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const passport = require("passport");
const session = require("express-session");
const { swaggerUi, specs } = require("../swagger");

dotenv.config({ path: "config.env" });
require("./config/passport");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
// Create uploads directory and subdirectories if they don't exist
const baseUploadsPath = path.join(__dirname, "..", "uploads");
const folders = [
  "playlists",
  "videos",
  "videosImages",
  "flashCards",
  "quizzes",
  "subtitles",
];

if (!fs.existsSync(baseUploadsPath)) {
  fs.mkdirSync(baseUploadsPath);
}

folders.forEach((folder) => {
  const folderPath = path.join(baseUploadsPath, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
});

// Routes
const mountRoutes = require("./routes");
const User = require("./models/userModel");
const PlanModel = require("./models/planModel");
// Connect With DB
dbConnection();

// Express App
const app = express();
// const port = process.env.PORT || 8000;
const port = 8000 || process.env.PORT;

// app.use(
//   cors({
//     origin: "https://idyllic-marshmallow-df4195.netlify.app",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(cors());
app.options(/(.*)/, cors());

app.set("trust proxy", true);

// compress all responses
app.use(compression());

// Middleware
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.json({ limit: '20kb' }));

app.use(express.static(path.join(__dirname, "..", "uploads")));
// // app.use("/uploads", express.static("uploads"));
// app.use("/videos", express.static("videos"));
// app.use("/images", express.static("images"));
// app.use("/audios", express.static("audios"));
// app.use("/others", express.static("others"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Limit each IP to 5 requests per `window` (here, per 5 minutes)
const limiter = rateLimit({
  windowMs: 10 * 1000, // 5 minutes
  max: 5,
  message:
    "Too many accounts created from this IP, please try again after an 5 minutes",
});

// Apply the rate limiting middleware to all requests
// app.use('/api/v1/auth/login', limiter);
// app.use('/api/v1/auth/signup', limiter);
const authRoutes = ["/api/v1/auth/login", "/api/v1/auth/signup"];
authRoutes.forEach((route) => {
  app.use(route, limiter);
});

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
    checkBody: true,
    checkQuery: true,
  })
);

// إعداد middleware للجلسة قبل Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret", // يمكن أن تكون هذه قيمة مشفرة
    resave: false, // لا تعيد حفظ الجلسة إذا لم تتغير
    saveUninitialized: false, // لا تحفظ الجلسة إذا لم تكن مبدوءة
  })
);

// إعداد passport
app.use(passport.initialize());
app.use(passport.session());

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Mount Routes
mountRoutes(app);

async function addAdmin() {
  let admin = await User.findOne({ email: "a7medelshhat@gmail.com" });
  if (!admin) {
    await User.create({
      name: "Ahmed",
      email: "a7medelshhat@gmail.com",
      password: "pass123",
      role: "admin",
      points: 0,
    });
  }
}

addAdmin();

app.all(/(.*)/, (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

async function insertPlans() {
  await PlanModel.insertMany([
    {
      title: "Buy Points",
      type: "points",
      price: 10,
      features: [
        "Access to core features",
        "Email support only",
        "Standard performance speed",
        "Single device access",
        "Basic updates included",
        "5GB storage space",
        "Limited transactions per month",
        "Basic templates and layouts",
        "Essential analytics reports",
        "Affordable starter plan",
      ],
    },

    {
      title: "Premium Plus",
      type: "premium_plus",
      price: 25,
      features: [
        "All Basic features included",
        "Email & live chat support",
        "Access on up to 3 devices",
        "50GB storage space",
        "Double monthly transactions",
        "More customization options",
        "Third-party integrations",
        "Advanced analytics reports",
        "Early access to updates",
        "Exclusive discounts & rewards",
      ],
    },

    {
      title: "Premium",
      type: "premium",
      price: 15,
      features: [
        "All Premium features included",
        "24/7 VIP customer support",
        "Unlimited device access",
        "1TB cloud storage",
        "Unlimited monthly transactions",
        "Access to all premium templates",
        "AI-powered detailed analytics",
        "Extra security features (2FA & backup)",
        "Priority access to new features",
        "Exclusive perks & gifts",
      ],
    },
  ]);
}

const server = app.listen(port, () => {
  console.log(`App running in port ${port} http://localhost:${port}/`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

// Handle rejection outside express
// Events => list => callback(err)
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down......");
    process.exit(1);
  });
});
