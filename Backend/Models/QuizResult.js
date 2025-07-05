import mongoose from "mongoose";
const answerSchema = new mongoose.Schema({
  question: { type: String, required: false, default: "" },
  userAnswer: { type: String, required: false, default: "" },
  correctAnswer: { type: String, required: false, default: "" },
  isCorrect: { type: Boolean, required: false, default: "" },
  feedback: { type: String }, // Per-question feedback (as a string)
});

const quizResultSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true }, // ✅ NEW
    answers: [answerSchema],
    feedback: [{ type: Object }], // Change from [String] to accept objects
    submittedAt: { type: Date, default: Date.now },
    totalQuestions: { type: Number, required: true },
    timeAgo: { type: String, required: true },
    totalQuizzesCompleted: { type: Number, required: true },
    averageScore: { type: Number, required: true },
    averagePercentage: { type: Number, required: true },
    improvement: { type: Number, required: true }, // Ensure it's a number
  },
  { timestamps: true }
);

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
export default QuizResult;
