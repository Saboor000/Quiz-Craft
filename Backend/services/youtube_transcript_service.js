import { YoutubeTranscript } from "youtube-transcript";
import { generateQuizWithChatGPT } from "./openaiService.js"; // Adjust the import path as needed

// Utility to extract YouTube video ID from URL
const extractYouTubeVideoId = (url) => {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
};

// Fetch transcript from YouTube
const getTranscriptFromYouTube = async (videoId) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map((t) => t.text).join(" ");
    return fullText;
  } catch (error) {
    console.error("❌ Error fetching YouTube transcript:", error.message);
    throw new Error("Transcript not available for this video.");
  }
};

// Generate quiz from YouTube video URL
export const generateQuizFromYouTube = async (req, res) => {
  const { videoUrl, difficulty } = req.body;

  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

  try {
    const transcriptText = await getTranscriptFromYouTube(videoId);
    const quiz = await generateQuizWithChatGPT(transcriptText, difficulty);
    res.status(200).json({ quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// For service file use
export const extractYouTubeTranscript = async (videoUrl) => {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");
  const transcript = await getTranscriptFromYouTube(videoId);
  return transcript;
};
