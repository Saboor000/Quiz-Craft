// services/quizService.js
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Quiz from "../Models/QuizModel.js";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import axios from "axios";
// services/quizService.js (inside handleQuizCreation)
import {
  extractTextFromDocx,
  extractTextFromGenericFile,
} from "./fileService.js";
import { extractYouTubeTranscript } from "./youtube_transcript_service.js";

import {
  extractTextFromAnyVideo,
  extractAudioFromVideo,
  transcribeAudio,
  downloadOnlineVideo,
} from "./videoService.js";
import ytdl from "ytdl-core";
import pkg from "youtube-transcript";
import { generateQuizWithChatGPT } from "./openaiService.js";
import { detectQuizTopic } from "../services/openaiService.js";

const { getYoutubeTranscript } = pkg;

const generateQuizPDF = (quizTitle, questions) => {
  return new Promise((resolve, reject) => {
    const pdfPath = path.join("temp", `${Date.now()}_quiz.pdf`);

    // Ensure the temp directory exists
    if (!fs.existsSync("temp")) {
      fs.mkdirSync("temp");
    }

    const doc = new PDFDocument();
    console.log("In The Generate Quiz PDF");

    // Create a write stream to save the PDF
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Add content to the PDF
    doc.fontSize(20).text(quizTitle, { align: "center" });
    doc.moveDown();

    questions.forEach((q, idx) => {
      doc.fontSize(14).text(`Q${idx + 1}: ${q.question}`);
      q.options.forEach((opt, optIdx) => {
        doc.fontSize(12).text(`  ${String.fromCharCode(65 + optIdx)}. ${opt}`);
      });
      doc.moveDown();
    });

    // Finalize the document
    doc.end();
    console.log("Document of Quiz PDF Here");

    // Handle the finish event to resolve the promise
    writeStream.on("finish", () => {
      resolve(pdfPath);
      console.log("Path of the PDF in Generate PDF", pdfPath);
    });

    // Handle errors in the stream
    writeStream.on("error", (err) => {
      reject(err);
      console.log("Error in this file Generate PDF", err);
    });

    // Handle errors in the document creation
    doc.on("error", (err) => {
      reject(err);
      console.log("Error generating PDF document", err);
    });
  });
};

// Helper function to send Email
const sendQuizEmail = async (toEmail, subject, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Or your email service
    auth: {
      user: "saboorsamad010@gmail.com", // Your email address
      pass: "uitkpfxehuzgfgeu", // Your email password or app password
    },
  });
  console.log("In The Send Quiz Email File");
  const mailOptions = {
    from: `"Quiz Generator with ChatGPT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    text: "Congratulations! Your quiz has been generated successfully. Please find the quiz PDF attached.",
    attachments: [
      {
        filename: "quiz.pdf",
        path: pdfPath,
      },
    ],
  };
  console.log("");
  await transporter.sendMail(mailOptions);
};

export const handleQuizCreation = async (req, res) => {
  const supportedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/pdf", // .pdf ✅ added
    "text/plain", // .txt
  ];

  const {
    quizDuration,
    textInput,
    selectedVideo,
    selectedLocalVideo,
    difficultyLevel,
    questionType, // New field for question type
    numberOfQuestions, // ✅ New field
  } = req.body;

  const userId = req.user.id;
  const file = req.file;
  const userEmail = req.user.email; // 👈 make sure req.user contains email
  const duration = parseInt(quizDuration, 10);

  const validDifficultyLevels = ["easy", "medium", "hard"];
  if (!validDifficultyLevels.includes(difficultyLevel)) {
    console.log("difficulty level");
    return res.status(400).json({ error: "Invalid difficulty level." });
  }

  if (isNaN(duration) || duration <= 0) {
    return res
      .status(400)
      .json({ error: "Quiz duration must be a positive integer." });
  }

  const numQuestions = parseInt(numberOfQuestions, 10);

  if (isNaN(numQuestions) || numQuestions <= 0 || numQuestions > 50) {
    console.log("📊 Number of Questions:", numQuestions);
    return res.status(400).json({
      error: "Please provide a valid number of questions between 1 and 50.",
    });
  }

  if (!textInput && !selectedVideo && !selectedLocalVideo && !file) {
    return res
      .status(400)
      .json({ error: "Provide text input, video URL, local video, or file." });
  }

  try {
    let inputText = "";

    // Handling text input
    if (textInput) {
      inputText = textInput;
      console.log("Quiz Service Text Input IF");
      // Handling video URL
    }

    // Handling remote video (YouTube) or other selected video
    else if (selectedVideo) {
      try {
        if (ytdl.validateURL(selectedVideo)) {
          try {
            // Call Flask API to get YouTube transcript with a timeout
            const response = await axios.post(
              "http://localhost:5000/transcript",
              { video_url: selectedVideo },
              { timeout: 30000 } // 30s
            );
            console.log("In The Selected Video Backend python Api Hit");
            inputText = response.data.transcript || "";

            if (!inputText || inputText.trim().length === 0) {
              throw new Error(
                "Empty transcript returned from transcript service"
              );
            }
          } catch (transcriptErr) {
            // Log detailed info for debugging
            console.warn("Transcript service failed:", transcriptErr.message);
            if (transcriptErr.response) {
              console.warn(
                "Transcript service response data:",
                transcriptErr.response.data
              );
            }

            // Fallback: download video and extract audio, then transcribe locally
            const tempVideoPath = path.join(
              "temp",
              `downloaded_video_${Date.now()}.mp4`
            );
            const audioFilePath = path.join(
              "temp",
              `downloaded_audio_${Date.now()}.wav`
            );

            try {
              await downloadOnlineVideo(selectedVideo, tempVideoPath);
              await extractAudioFromVideo(tempVideoPath, audioFilePath);
              inputText = await transcribeAudio(audioFilePath);

              // Cleanup if files exist
              try {
                if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
              } catch (e) {
                console.warn(e);
              }
              try {
                if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
              } catch (e) {
                console.warn(e);
              }

              if (!inputText || inputText.trim().length === 0) {
                throw new Error("Fallback transcription returned no text");
              }
              console.log("Fallback audio transcription succeeded");
            } catch (fallbackErr) {
              console.error(
                "Fallback audio transcription failed:",
                fallbackErr
              );
              return res.status(500).json({
                error: `Failed to extract text from the video URL: ${fallbackErr.message}`,
              });
            }
          }
        } else {
          // Non-YouTube remote video: download and transcribe
          const tempVideoPath = path.join(
            "temp",
            `downloaded_video_${Date.now()}.mp4`
          );
          const audioFilePath = path.join(
            "temp",
            `downloaded_audio_${Date.now()}.wav`
          );

          try {
            await downloadOnlineVideo(selectedVideo, tempVideoPath);
            await extractAudioFromVideo(tempVideoPath, audioFilePath);
            inputText = await transcribeAudio(audioFilePath);
            try {
              if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
            } catch (e) {
              console.warn(e);
            }
            try {
              if (fs.existsSync(audioFilePath)) fs.unlinkSync(audioFilePath);
            } catch (e) {
              console.warn(e);
            }
          } catch (err) {
            console.error("Error processing non-YouTube video:", err);
            return res.status(500).json({
              error: `Failed to extract text from the video URL: ${err.message}`,
            });
          }
        }
      } catch (err) {
        console.error("Error processing video:", err);
        return res.status(500).json({
          error: `Failed to extract text from the video URL: ${err.message}`,
        });
      }
    } else if (selectedLocalVideo) {
      try {
        const videoPath = path.resolve("uploads", selectedLocalVideo);
        const audioPath = path.join("temp", "local_audio.wav");

        await extractAudioFromVideo(videoPath, audioPath);
        inputText = await transcribeAudio(audioPath);

        // Cleanup
        fs.unlinkSync(audioPath);
      } catch (err) {
        console.error("Error processing local video:", err);
        return res
          .status(500)
          .json({ error: "Failed to extract text from the local video." });
      }

      // Handling file upload
    } else if (file) {
      // ✅ File type validation
      if (!supportedTypes.includes(file.mimetype)) {
        console.log("In The Nested File One ");
        return res.status(400).json({
          error:
            "Unsupported file type. Please upload .docx, .pdf, or .txt files only.",
        });
      }

      try {
        inputText = await extractTextFromGenericFile(file.path, file.mimetype);
        if (!inputText || inputText.trim().length === 0) {
          return res.status(400).json({
            error: "The uploaded file contains no extractable text.",
          });
        }
      } catch (err) {
        console.error("File extraction error:", err);
        return res.status(500).json({
          error: err.message || "Failed to extract text from the file.",
        });
      }
    }

    console.log("Extracted Content:", inputText);
    if (!inputText || inputText.trim().length < 0) {
      return res.status(400).json({
        error:
          "Not enough content for quiz generation. Please provide more detailed input.",
      });
    }

    const quizTopic = await detectQuizTopic(inputText);
    console.log("Detected Quiz Topic:", quizTopic);

    const userPreviousQuizzes = await Quiz.find({ userId });
    const previousQuestions = userPreviousQuizzes.flatMap((quiz) =>
      quiz.questions.map((q) => q.question)
    );
    // Generate quiz from extracted content
    const quizContent = await generateQuizWithChatGPT(
      inputText,
      difficultyLevel,
      questionType, // Pass questionType to the generation function
      numQuestions,
      previousQuestions
    );
    console.log("Quiz Content", quizContent);
    console.log(questionType);
    if (!Array.isArray(quizContent)) {
      return res.status(500).json({ error: "Invalid quiz format from OpenAI" });
    }

    const quiz = await Quiz.create({
      userId,
      questions: quizContent,
      quizDuration: duration,
      difficultyLevel,
      selectedFile: file ? `/uploads/${file.filename}` : undefined,
      selectedVideo,
      selectedLocalVideo,
      quizTitle: `${quizTopic} Quiz - ${new Date().toLocaleDateString()}`,
      questionType, // Save questionType to the database
      quizTopic,
      numQuestions,
    });

    // ✅ After quiz is created - create PDF
    const pdfPath = await generateQuizPDF(quiz.quizTitle, quiz.questions);

    // ✅ Send email with PDF
    await sendQuizEmail(userEmail, `Your Quiz: ${quiz.quizTitle}`, pdfPath);

    // ✅ Cleanup temp PDF file after sending
    fs.unlinkSync(pdfPath);
    console.log("✅ Quiz Created and Email Sent Successfully!");

    console.log("\n✅ Quiz Created Successfully:");
    console.log("👤 User ID:", userId);
    console.log("📝 Quiz ID:", quiz._id);
    console.log("📌 Title:", quiz.quizTitle);
    console.log("📊 Difficulty:", difficultyLevel);
    console.log("⏱ Duration (minutes):", duration);
    console.log("📚 Questions:", questionType);

    quiz.questions.forEach((q, index) => {
      console.log(`\nQ${index + 1}: ${q.question}`);
      q.options.forEach((option, i) => {
        console.log(`   ${String.fromCharCode(65 + i)}. ${option}`);
      });
      console.log(`   ✅ Correct Answer: ${q.correctAnswer}`);
    });

    res.status(201).json({
      message: "Quiz created successfully",
      success: true,
      quizId: quiz._id,
    });
  } catch (err) {
    console.error("Error creating quiz:", err);
    // Include message and stack for easier debugging in development
    res.status(500).json({
      error: err.message || "An error occurred while creating the quiz.",
      ...(err.stack ? { stack: err.stack } : {}),
    });
  }
};

export const fetchUserQuizzes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0; // if ?limit=3 is passed, use it; otherwise, return all
    const quizzes = await Quiz.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json(quizzes);
  } catch {
    res.status(500).json({ error: "Failed to fetch user quizzes." });
  }
};

export const fetchQuizById = async (req, res) => {
  const { quizId } = req.params;
  console.log("hello1", quizId);

  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    return res.status(400).json({ error: "Invalid quiz ID format" });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    console.log("hello2", quizId);
    res.status(200).json(quiz);
  } catch {
    res.status(500).json({ error: "Failed to fetch the quiz." });
  }
};

export const updateQuizById = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      req.body,
      { new: true }
    );
    if (!updatedQuiz) return res.status(404).json({ error: "Quiz not found" });
    res.status(200).json(updatedQuiz);
  } catch {
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

export const deleteQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    if (quiz.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this quiz" });
    }
    await Quiz.findByIdAndDelete(req.params.quizId);
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch {
    res
      .status(500)
      .json({ error: "An error occurred while deleting the quiz" });
  }
};
