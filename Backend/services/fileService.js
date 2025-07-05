import fs from "fs";
import fetch from "node-fetch";
import mammoth from "mammoth";
import ffmpeg from "fluent-ffmpeg";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import pdfParse from "pdf-parse";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const extractTextFromDocx = (filePath) => {
  return mammoth.extractRawText({ path: filePath }).then((res) => res.value);
};

export const extractTextFromTxt = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) reject(new Error("Failed to read the .txt file."));
      else resolve(data);
    });
  });
};

export const extractTextFromPdf = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    if (!data.text || !data.text.trim()) {
      throw new Error("No text could be extracted from the PDF.");
    }
    return data.text.trim();
  } catch (error) {
    console.error("PDF parsing failed:", error.message);
    throw new Error("Failed to extract text from the .pdf file.");
  }
};

export const extractTextFromGenericFile = async (filePath, mimetype) => {
  switch (mimetype) {
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractTextFromDocx(filePath);
    case "text/plain":
      return extractTextFromTxt(filePath);
    case "application/pdf":
      return extractTextFromPdf(filePath);
    default:
      throw new Error("Unsupported file type for quiz generation.");
  }
};
