import mongoose from "mongoose";

// Question schema for individual quiz questions
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: function () {
      return this.options?.length > 0; // Required only if options exist
    },
  },
  correctAnswer: { type: String, required: true },
});

// Quiz schema
const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    quizTitle: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true, // Removes any leading or trailing spaces
    },
    quizTopic: {
      type: String,
    },
    quizDuration: {
      type: Number,
      required: [true, "Quiz duration is required"],
      min: [1, "Quiz duration must be at least 1 minute"],
      validate: {
        validator: Number.isInteger,
        message: "Quiz duration must be an integer",
      },
    },
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    questionType: {
      type: String,
      enum: ["mcq", "open ended", "mixed"],
      required: [true, "Question type is required"],
    },
    numQuestions: {
      type: Number,
      required: true,
    },
    questions: {
      type: [questionSchema],
      required: [true, "Questions are required"],
    },
    selectedFile: {
      type: String,
      validate: {
        validator: function (value) {
          return !value || /\.(pdf|docx|txt)$/i.test(value);
        },
        message: "Selected file must be a .pdf, .docx, or .txt file",
      },
    },
    selectedVideo: {
      type: String,
      validate: {
        validator: function (value) {
          return (
            !value ||
            /^(https?:\/\/)?(www\.)?[\w\-]+\.[\w\-]+(\/[\w\-?=&#%]*)*$/.test(
              value
            )
          );
        },
        message: "Invalid video URL format",
      },
    },
    selectedLocalVideo: {
      type: String,
      validate: {
        validator: function (value) {
          return !value || /\.(mp4|mkv|avi)$/i.test(value);
        },
        message: "Selected local video must be .mp4, .mkv, or .avi file",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    validate: {
      // Ensures that both local and online video URLs cannot be set together
      validator: function () {
        const hasOnlineVideo = !!this.selectedVideo;
        const hasLocalVideo = !!this.selectedLocalVideo;
        return !(hasOnlineVideo && hasLocalVideo); // Cannot have both
      },
      message:
        "You can only upload either a local video or an online video, not both.",
    },
  }
);

// Export the Quiz model
export default mongoose.model("Quiz", quizSchema);
