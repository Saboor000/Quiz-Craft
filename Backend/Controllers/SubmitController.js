import mongoose from "mongoose";
import Quiz from "../Models/QuizModel.js";
import QuizResult from "../Models/QuizResult.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import User from "../Models/UserModel.js";
import moment from "moment";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 📤 Submit Quiz
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userAnswers, userId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(quizId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quizId or userId." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !Array.isArray(quiz.questions)) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found or no questions." });
    }

    if (
      !Array.isArray(userAnswers) ||
      userAnswers.length !== quiz.questions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Answers are missing or don't match the number of questions.",
      });
    }

    let score = 0;
    const totalQuestions = quiz.questions.length;

    // ➕ Add per-question feedback
    const detailedAnswers = await Promise.all(
      userAnswers.map(async (answer, index) => {
        const question = quiz.questions[index];
        const correctAnswer = question.correctAnswer;
        // If answer is empty or null, treat as unanswered
        const isUnanswered =
          answer === undefined || answer === null || answer === "";
        const isCorrect = !isUnanswered && answer === correctAnswer;

        if (isCorrect) score++;

        let feedbackPrompt;
        if (isUnanswered) {
          feedbackPrompt = `Question: ${question.question}\nNo answer was provided.\nCorrect Answer: ${correctAnswer}\nProvide concise feedback for an unanswered question.`;
        } else {
          feedbackPrompt = `Question: ${
            question.question
          }\nYour Answer: ${answer}\nCorrect Answer: ${correctAnswer}\nWas the answer correct? ${
            isCorrect ? "Yes" : "No"
          }\n\nProvide concise feedback on this specific answer.`;
        }
        let perQuestionFeedback = "";
        try {
          perQuestionFeedback = await getChatGPTFeedback(feedbackPrompt);
        } catch (err) {
          console.error("OpenAI feedback error:", err);
          perQuestionFeedback = "Feedback not available.";
        }

        return {
          question: question.question,
          userAnswer: isUnanswered ? "" : answer,
          correctAnswer,
          isCorrect,
          feedback: perQuestionFeedback,
        };
      })
    );

    const percentage = ((score / totalQuestions) * 100).toFixed(2);

    const feedbackPrompt = generateFeedbackPrompt(
      detailedAnswers,
      score,
      totalQuestions
    );
    let chatGPTFeedback = "";
    try {
      chatGPTFeedback = await getChatGPTFeedback(feedbackPrompt);
    } catch (err) {
      console.error("OpenAI overall feedback error:", err);
      chatGPTFeedback = "Feedback not available.";
    }

    const submittedAt = new Date();
    const timeAgo = moment(submittedAt).fromNow(); // Store timeAgo directly

    const userResults = await QuizResult.find({ userId });
    const previousTotalQuizzes = userResults.length;
    const previousTotalScore = userResults.reduce((sum, r) => sum + r.score, 0);
    const previousAverageScore =
      previousTotalQuizzes > 0 ? previousTotalScore / previousTotalQuizzes : 0;

    const totalQuizzesCompleted = previousTotalQuizzes + 1;
    const totalScore = previousTotalScore + score;
    const averageScore = (totalScore / totalQuizzesCompleted).toFixed(2);

    const improvement = (averageScore - previousAverageScore).toFixed(2);

    const totalPercentage =
      userResults.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) +
      parseFloat(percentage);
    const averagePercentage = (totalPercentage / totalQuizzesCompleted).toFixed(
      2
    );

    const result = new QuizResult({
      quizId: new mongoose.Types.ObjectId(quizId),
      userId: new mongoose.Types.ObjectId(userId),
      score,
      percentage,
      answers: detailedAnswers,
      feedback: chatGPTFeedback,
      submittedAt,
      totalQuestions,
      totalQuizzesCompleted,
      averageScore,
      averagePercentage,
      timeAgo,
      improvement,
    });

    await result.save();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully.",
      resultId: result._id,
      score,
      percentage,
      feedback: chatGPTFeedback,
      submittedAt: result.createdAt,
      totalQuestions,
      answers: result.answers,
      timeAgo,
      totalQuizzesCompleted,
      averageScore,
      averagePercentage,
      improvement,
    });
  } catch (error) {
    console.error("🔥 SubmitQuiz Error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// 🔁 Generate feedback prompt
const generateFeedbackPrompt = (answers, score, totalQuestions) => {
  let feedbackPrompt = `Provide feedback based on the following quiz results:\n\n`;

  answers.forEach((answer, index) => {
    feedbackPrompt += `Question ${index + 1}: ${answer.question}\n`;
    feedbackPrompt += `Your answer: ${answer.userAnswer}\n`;
    feedbackPrompt += `Correct answer: ${answer.correctAnswer}\n`;
    feedbackPrompt += `Correct: ${answer.isCorrect ? "Yes" : "No"}\n\n`;
  });

  feedbackPrompt += `Total score: ${score} out of ${totalQuestions}\n`;
  feedbackPrompt += `Percentage: ${((score / totalQuestions) * 100).toFixed(
    2
  )}%\n\n`;
  feedbackPrompt += `Provide overall feedback on the user's performance, highlighting strengths and areas for improvement.`;

  return feedbackPrompt;
};

// 🧠 Get GPT Feedback
const getChatGPTFeedback = async (prompt) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("🔥 Error generating ChatGPT feedback:", error);
    return "Feedback not available.";
  }
};

// 🕒 TimeAgo Helper
// 🕒 TimeAgo Helper
const getTimeAgo = (submittedAt) => {
  const timeAgo = moment(submittedAt).fromNow();

  // Adjust for "just now" edge case and convert it to a more informative string
  if (timeAgo === "a few seconds ago") {
    return "Just now"; // More readable format instead of "a few seconds ago"
  }

  return timeAgo; // Return other cases as they are
};

// 📊 Get Quiz Result
const getQuizResult = async (req, res) => {
  try {
    const { quizId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(quizId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid quizId or userId." });
    }
    const result = await QuizResult.findOne({
      quizId: new mongoose.Types.ObjectId(quizId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found." });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Dynamically calculate timeAgo for quiz result
    const timeAgo = result.timeAgo;

    res.json({
      score: result.score,
      percentage: result.percentage,
      feedback: result.feedback,
      submittedAt: result.submittedAt,
      timeAgo: timeAgo,
      answers: result.answers,
      totalQuestions: quiz.questions.length,
      totalQuizzesCompleted: result.totalQuizzesCompleted,
      averageScore: result.averageScore,
      averagePercentage: result.averagePercentage,
      improvement: result.improvement, // Ensure this is included
    });
  } catch (error) {
    console.error("🔥 Error in getQuizResult:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getRecentQuizAttempts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recentResults = await QuizResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("quizId");

    const formattedResults = recentResults.map((result) => ({
      quiz: result.quizId,
      score: result.score,
      percentage: result.percentage,
      submittedAt: result.submittedAt,
      timeAgo: getTimeAgo(result.submittedAt), // Use getTimeAgo function
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("🔥 Error in getRecentQuizAttempts:", error);
    res.status(500).json({ message: "Failed to fetch recent attempts." });
  }
};

export const getAllQuizAttempts = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all quiz attempts by the user and populate quiz details
    const allResults = await QuizResult.find({ userId })
      .populate("quizId")
      .sort({ submittedAt: -1 }); // Sort by submission date in descending order

    // Format the results
    const formattedResults = allResults.map((result) => ({
      quiz: result.quizId,
      score: result.score,
      percentage: result.percentage,
      submittedAt: result.submittedAt,
      timeAgo: getTimeAgo(result.submittedAt),
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("🔥 Error in getAllQuizAttempts:", error);
    res.status(500).json({ message: "Failed to fetch quiz attempts." });
  }
};
// 📅 Today's Activity
const getTodaysActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const resultsToday = await QuizResult.find({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const quizzesCompleted = resultsToday.length;
    const avgScore =
      resultsToday.reduce((sum, r) => sum + r.score, 0) /
      (quizzesCompleted || 1);
    const avgPercentage =
      resultsToday.reduce((sum, r) => sum + parseFloat(r.percentage || 0), 0) /
      (quizzesCompleted || 1);

    res.json({
      quizzesCompleted,
      averageScore: avgScore.toFixed(2),
      averagePercentage: avgPercentage.toFixed(2),
    });
  } catch (error) {
    console.error("🔥 Error fetching today's activity:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 📈 Compare Current vs Last Month Activity
const getMonthlyProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const now = new Date();

    // 🔹 Get start & end of current month
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // 🔹 Get start & end of previous month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    // 🧮 Fetch quiz results
    const currentMonthResults = await QuizResult.find({
      userId,
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    });

    const lastMonthResults = await QuizResult.find({
      userId,
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    const thisMonthCount = currentMonthResults.length;
    const lastMonthCount = lastMonthResults.length;

    const percentageChange =
      lastMonthCount === 0
        ? 100
        : (((thisMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(
            2
          );

    res.json({
      improvement: parseFloat(percentageChange),
      totalQuizzes: thisMonthCount,
      thisMonthCount,
      lastMonthCount,
      percentageChange: parseFloat(percentageChange),
    });
  } catch (error) {
    console.error("🔥 Error calculating monthly progress:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// 📊 Performance Analytics
const getPerformanceAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const results = await QuizResult.find({ userId });

    const total = results.length;
    if (total === 0) {
      return res.json({
        completionRate: 0,
        scoreDistribution: {
          excellent: 0,
          good: 0,
          needsImprovement: 0,
        },
      });
    }

    let excellent = 0,
      good = 0,
      needsImprovement = 0;

    results.forEach((r) => {
      const percent = parseFloat(r.percentage);
      if (percent >= 80) excellent++;
      else if (percent >= 60) good++;
      else needsImprovement++;
    });

    res.json({
      completionRate: ((total / total) * 100).toFixed(2), // Assuming user attempted all assigned quizzes
      scoreDistribution: {
        excellent: ((excellent / total) * 100).toFixed(2),
        good: ((good / total) * 100).toFixed(2),
        needsImprovement: ((needsImprovement / total) * 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error("🔥 Error in getPerformanceAnalytics:", error);
    res.status(500).json({ message: "Server error." });
  }
};

const getOverallPerformance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    // Fetch all quiz results for the user
    const userResults = await QuizResult.find({ userId });

    if (!userResults || userResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No quiz results found for this user." });
    }

    // Calculate the total number of quizzes
    const totalQuizzes = userResults.length;

    // Calculate the total score and total percentage
    const totalScore = userResults.reduce(
      (sum, result) => sum + result.score,
      0
    );
    const totalPercentage = userResults.reduce(
      (sum, result) => sum + parseFloat(result.percentage || 0),
      0
    );

    const averageScore = (totalScore / totalQuizzes).toFixed(2);
    const averagePercentage = (totalPercentage / totalQuizzes).toFixed(2);

    // Calculate improvement from the user's most recent quiz
    const lastQuizResult = userResults[userResults.length - 1];
    const previousQuizzes = userResults.slice(0, userResults.length - 1);
    const previousAverageScore =
      previousQuizzes.length > 0
        ? previousQuizzes.reduce((sum, result) => sum + result.score, 0) /
          previousQuizzes.length
        : 0;

    const improvement = (averageScore - previousAverageScore).toFixed(2);

    res.json({
      totalQuizzes,
      averageScore,
      averagePercentage,
      improvement,
    });
  } catch (error) {
    console.error("🔥 Error fetching overall performance:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export {
  submitQuiz,
  getQuizResult,
  getTodaysActivity,
  getMonthlyProgress,
  getPerformanceAnalytics,
  getOverallPerformance,
};
