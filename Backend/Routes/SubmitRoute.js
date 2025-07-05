import express from "express";
import {
  submitQuiz,
  getQuizResult,
  getTodaysActivity,
  getMonthlyProgress,
  getPerformanceAnalytics,
  getOverallPerformance,
  getRecentQuizAttempts,
  getAllQuizAttempts,
} from "../Controllers/SubmitController.js";

const router = express.Router();

router.post("/:quizId", submitQuiz);
router.get("/:quizId/result/:userId", getQuizResult);
router.get("/recent-attempts/:userId", getRecentQuizAttempts);
router.get("/all-attempts/:userId", getAllQuizAttempts);
router.get("/activity/today/:userId", getTodaysActivity);
router.get("/activity/monthly-progress/:userId", getMonthlyProgress);
router.get("/performance/:userId", getPerformanceAnalytics);
router.get("/performance/overall/:userId", getOverallPerformance);

export default router;
