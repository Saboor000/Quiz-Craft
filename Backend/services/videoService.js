import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";
import { exec } from "child_process";
import axios from "axios";
import pkg from "youtube-transcript"; // CommonJS import
const { getYoutubeTranscript } = pkg; // Destructuring the function

// Extract transcript from YouTube video
export const extractYouTubeTranscript = async (videoUrl) => {
  try {
    const transcript = await getYoutubeTranscript(videoUrl);
    return transcript.map((line) => line.text).join(" ");
  } catch (error) {
    console.error("YouTube transcript not available:", error.message);
    return null;
  }
};

// Download online video (non-YouTube)
export const downloadOnlineVideo = async (url, outputPath) => {
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(outputPath));
    writer.on("error", reject);
  });
};

// Extract audio using FFmpeg
export const extractAudioFromVideo = (videoPath, audioPath) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 44100 -ac 1 "${audioPath}" -y`;
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("FFmpeg error:", stderr);
        return reject("Failed to extract audio from video.");
      }
      resolve();
    });
  });
};

// Transcribe audio using Whisper CLI
export const transcribeAudio = (audioPath) => {
  return new Promise((resolve, reject) => {
    const command = `whisper "${audioPath}" --language English --model base --output_format txt`;
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("Whisper CLI error:", stderr);
        return reject("Failed to transcribe audio.");
      }

      const txtPath = path.join(
        path.dirname(audioPath),
        path.basename(audioPath, path.extname(audioPath)) + ".txt"
      );

      fs.readFile(txtPath, "utf8", (err, data) => {
        if (err) {
          console.error("Failed to read Whisper output file:", err);
          return reject("Failed to read transcription file.");
        }
        resolve(data);
      });
    });
  });
};

// Unified handler for any video source (YouTube, online, or local)
export const extractTextFromAnyVideo = async (source, isLocal = false) => {
  try {
    // YouTube handling
    if (!isLocal && ytdl.validateURL(source)) {
      const transcript = await extractYouTubeTranscript(source);
      if (transcript) return transcript;

      const tempPath = `temp/youtube-${Date.now()}.mp4`;
      await downloadOnlineVideo(source, tempPath);
      const audioPath = `temp/youtube-${Date.now()}.wav`;

      await extractAudioFromVideo(tempPath, audioPath);
      const text = await transcribeAudio(audioPath);

      // Cleanup: Check if files exist before deletion
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

      return text;
    }

    // Other online video
    if (!isLocal) {
      const tempPath = `temp/online-${Date.now()}.mp4`;
      await downloadOnlineVideo(source, tempPath);
      const audioPath = `temp/online-${Date.now()}.wav`;

      await extractAudioFromVideo(tempPath, audioPath);
      const text = await transcribeAudio(audioPath);

      fs.unlinkSync(tempPath);
      fs.unlinkSync(audioPath);

      return text;
    }

    // Local video file
    const audioPath = `temp/local-${Date.now()}.wav`;
    await extractAudioFromVideo(source, audioPath);
    const text = await transcribeAudio(audioPath);
    fs.unlinkSync(audioPath);
    return text;
  } catch (error) {
    console.error("Video transcription failed:", error);
    throw new Error("Failed to extract text from video.");
  }
};
