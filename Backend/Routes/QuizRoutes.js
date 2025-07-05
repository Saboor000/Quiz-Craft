import express from "express";
import passport from "passport";
import multer from "multer";
import path from "path";
import {
  createQuiz,
  getUserQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../Controllers/QuizController.js";

const quizRouter = express.Router();

const MAX_FILE_SIZE_MB = 10; // 10MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// === MULTER STORAGE CONFIG ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// === MULTER FILE FILTER ===
const fileFilter = (req, file, cb) => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const error = new multer.MulterError("LIMIT_FILE_SIZE", file.fieldname);
    error.message = `File "${file.originalname}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

// === JWT PROTECTION ===
quizRouter.use(passport.authenticate("jwt", { session: false }));

// === CREATE QUIZ ROUTE WITH FILE UPLOAD SUPPORT ===
quizRouter.post(
  "/create",
  (req, res, next) => {
    upload.fields([
      { name: "file", maxCount: 1 },
      { name: "selectedLocalVideo", maxCount: 1 },
    ])(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return next(err);
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      console.log("Received Request Body:", req.body);
      console.log("Files:", req.files);
      console.log("YouTube URL:", req.body.youtubeUrl);

      const duration = parseInt(req.body.quizDuration, 10);
      if (!duration || isNaN(duration) || duration <= 0) {
        return res
          .status(400)
          .json({ error: "Quiz duration must be a positive integer." });
      }

      // Attach uploaded files to req object
      if (req.files?.file?.[0]) {
        req.file = req.files.file[0];
      }
      if (req.files?.selectedLocalVideo?.[0]) {
        req.body.selectedLocalVideo = req.files.selectedLocalVideo[0].filename;
      }

      req.body.quizDuration = duration;

      if (req.body.youtubeUrl) {
        console.log("Handling YouTube URL:", req.body.youtubeUrl);
        // Add logic here to handle YouTube processing
      }

      // Proceed with quiz creation
      await createQuiz(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// === OTHER ROUTES (Unchanged) ===

quizRouter.get("/", async (req, res, next) => {
  try {
    await getUserQuizzes(req, res);
  } catch (error) {
    next(error);
  }
});

quizRouter.get("/:quizId", async (req, res, next) => {
  try {
    await getQuizById(req, res);
  } catch (error) {
    next(error);
  }
});

quizRouter.put("/:quizId", async (req, res, next) => {
  try {
    await updateQuiz(req, res);
  } catch (error) {
    next(error);
  }
});

quizRouter.delete("/:quizId", async (req, res, next) => {
  try {
    await deleteQuiz(req, res);
  } catch (error) {
    next(error);
  }
});

// === GLOBAL ERROR HANDLER ===
quizRouter.use((err, req, res, next) => {
  console.error("Quiz Route Error:", err);
  res.status(500).json({
    error:
      err.message ||
      "An unexpected error occurred while processing your request.",
  });
});

export default quizRouter;
