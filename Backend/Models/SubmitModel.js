import mongoose from "mongoose";

// Define the schema for each answer in the submission
const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  userAnswer: { type: String, default: "" },
  correctAnswer: { type: String, required: true },
});

// Define the schema for the quiz result
const submitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    answers: { type: [answerSchema] },
    score: { type: Number },
  },
  { timestamps: true }
); // Timestamp for tracking submission date and update

const Quiz = mongoose.model("Quiz", submitSchema);
export default Quiz;
