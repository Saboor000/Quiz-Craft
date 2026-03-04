import fs from "fs";
import path from "path";
import ytdl from "ytdl-core";
import { exec, execSync } from "child_process";
import axios from "axios";
import pkg from "youtube-transcript";

const { getYoutubeTranscript } = pkg;

// 🛠 CONFIG – Uses system PATH by default
const FFMPEG_PATH = ""; // Leave empty to use ffmpeg from system PATH
const WHISPER_PATH = "whisper"; // If installed globally via pip

// 🔍 Check if a command exists either in PATH or a custom location
const ensureExecutableExists = (cmd, customPath = "") => {
  try {
    // Try PATH first
    execSync(`${cmd} -version`, { stdio: "ignore" });
    return true;
  } catch {
    // If custom path is provided, try that
    if (customPath) {
      try {
        execSync(`"${customPath}" -version`, { stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

// 🎯 YouTube Transcript
export const extractYouTubeTranscript = async (videoUrl) => {
  try {
    const transcript = await getYoutubeTranscript(videoUrl);
    return transcript.map((line) => line.text).join(" ");
  } catch (error) {
    console.error("YouTube transcript not available:", error?.message || error);
    return null;
  }
};

// 🌐 Download online video
export const downloadOnlineVideo = async (url, outputPath) => {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      validateStatus: (status) => status >= 200 && status < 300,
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(outputPath));
      writer.on("error", (err) =>
        reject(new Error(`Download failed: ${err.message}`)),
      );
    });
  } catch (err) {
    throw new Error("Download error: " + err.message);
  }
};

// 🎵 Extract audio using FFmpeg CLI
export const extractAudioFromVideo = (videoPath, audioPath) => {
  return new Promise((resolve, reject) => {
    // Check FFmpeg (PATH or custom)
    if (!ensureExecutableExists("ffmpeg", FFMPEG_PATH)) {
      return reject(new Error("FFmpeg is not installed or not found."));
    }

    const dir = path.dirname(audioPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const ffmpegCmd =
      FFMPEG_PATH && ensureExecutableExists("ffmpeg", FFMPEG_PATH)
        ? `"${FFMPEG_PATH}"`
        : "ffmpeg";

    const command = `${ffmpegCmd} -i "${videoPath}" -vn -acodec pcm_s16le -ar 44100 -ac 1 "${audioPath}" -y`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("FFmpeg error:", stderr || err.message);
        return reject(new Error(`FFmpeg failed: ${stderr || err.message}`));
      }
      resolve();
    });
  });
};

// ✍️ Transcribe using Whisper CLI
export const transcribeAudio = (audioPath) => {
  return new Promise((resolve, reject) => {
    if (!ensureExecutableExists("whisper", WHISPER_PATH)) {
      return reject(new Error("Whisper CLI not installed or not found."));
    }

    const outDir = path.dirname(audioPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const whisperCmd = ensureExecutableExists("whisper")
      ? "whisper"
      : `"${WHISPER_PATH}"`;

    const command = `${whisperCmd} "${audioPath}" --language English --model base --output_format txt --output_dir "${outDir}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error("Whisper error:", stderr || err.message);
        return reject(new Error(`Whisper failed: ${stderr || err.message}`));
      }

      const txtPath = path.join(
        outDir,
        `${path.basename(audioPath, path.extname(audioPath))}.txt`,
      );

      fs.readFile(txtPath, "utf8", (err, data) => {
        if (err) {
          return reject(
            new Error(`Could not read transcription file: ${err.message}`),
          );
        }
        resolve(data);
      });
    });
  });
};

// 🔄 Main unified handler
export const extractTextFromAnyVideo = async (source, isLocal = false) => {
  try {
    if (!isLocal && ytdl.validateURL(source)) {
      const transcript = await extractYouTubeTranscript(source);
      if (transcript) return transcript;

      const tempPath = `temp/youtube-${Date.now()}.mp4`;
      if (!fs.existsSync("temp")) fs.mkdirSync("temp", { recursive: true });

      await downloadOnlineVideo(source, tempPath);
      const audioPath = tempPath.replace(".mp4", ".wav");
      await extractAudioFromVideo(tempPath, audioPath);

      const text = await transcribeAudio(audioPath);
      fs.rmSync(tempPath, { force: true });
      fs.rmSync(audioPath, { force: true });

      return text;
    }

    // 🌍 Other online videos
    if (!isLocal) {
      const tempPath = `temp/online-${Date.now()}.mp4`;
      await downloadOnlineVideo(source, tempPath);

      const audioPath = tempPath.replace(".mp4", ".wav");
      await extractAudioFromVideo(tempPath, audioPath);

      const text = await transcribeAudio(audioPath);
      fs.rmSync(tempPath, { force: true });
      fs.rmSync(audioPath, { force: true });

      return text;
    }

    // 💻 Local video
    const audioPath = `temp/local-${Date.now()}.wav`;
    await extractAudioFromVideo(source, audioPath);
    const text = await transcribeAudio(audioPath);
    fs.rmSync(audioPath, { force: true });

    return text;
  } catch (error) {
    console.error("Video transcription failed:", error?.message || error);
    throw new Error(error?.message || "Failed to extract text from video.");
  }
};
