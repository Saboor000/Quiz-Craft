// controllers/quizController.js
import {
  handleQuizCreation,
  fetchUserQuizzes,
  fetchQuizById,
  updateQuizById,
  deleteQuizById,
} from "../services/quizService.js";

export {
  handleQuizCreation as createQuiz,
  fetchUserQuizzes as getUserQuizzes,
  fetchQuizById as getQuizById,
  updateQuizById as updateQuiz,
  deleteQuizById as deleteQuiz,
};
