import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import userRouter from "./Routes/UserRoute.js"; // User routes
import quizRouter from "./Routes/QuizRoutes.js"; // Quiz routes
import submitRouter from "./Routes/SubmitRoute.js"; // Submit quiz results route
import "./passport.js"; // Google OAuth strategy setup
import "./passport-jwt.js"; // JWT strategy setup

dotenv.config();

const app = express();

// ✅ Middleware Setup
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*", // Allow requests from this origin
    methods: "GET,POST", // Specify allowed methods
  })
);

// ✅ Secure Session Handling
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

// ✅ Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// ✅ Database Connection with Error Handling
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost/User"
    );
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};
connectDB();

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/submit", submitRouter);

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// ✅ Handle Uncaught Exceptions & Rejections
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
