// services/openaiService.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateQuizWithChatGPT = async (
  inputText,
  difficultyLevel,
  questionType,
  numberOfQuestions,
  previousQuestions = []
) => {
  return generateQuizWithRetry(
    inputText,
    difficultyLevel,
    questionType,
    numberOfQuestions,
    previousQuestions
  );
};

const generateQuizWithRetry = async (
  inputText,
  difficultyLevel,
  questionType,
  numberOfQuestions = 5,
  retries = 3,
  delay = 1000,
  previousQuestions = [] // optional: array of questions to avoid repeating
) => {
  try {
    console.log("In GPT Chat Completion");
    let questionPrompt = `Generate a quiz with exactly ${numberOfQuestions} ${difficultyLevel} question${
      numberOfQuestions > 1 ? "s" : ""
    } based on the following detailed content:\n"${inputText}"\n\n`;

    if (previousQuestions.length > 0) {
      questionPrompt += `Avoid including any questions that have already been asked. Previously asked questions are:\n${previousQuestions
        .map((q) => `- ${q}`)
        .join("\n")}\n\n`;
    }

    if (["mcq", "mcqs"].includes(questionType.toLowerCase())) {
      questionPrompt += `The quiz should be multiple-choice questions (MCQs). Each question should have 4 options and a single correct answer. Format it as a JSON array with objects like this:\n[{"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Madrid"], "correctAnswer": "Paris"}]`;
    } else if (questionType.toLowerCase() === "open ended") {
      questionPrompt += `The quiz should contain open-ended questions that test the understanding of the material. Format it as a JSON array with objects like this:\n[{"question": "Explain the concept of gravity.", "correctAnswer": "Gravity is the force that attracts objects towards the center of the Earth."}]`;
    } else if (questionType.toLowerCase() === "mixed") {
      questionPrompt += `The quiz should contain a mix of multiple-choice questions (MCQs) and open-ended questions. Format it as a JSON array with objects like this:\n[{"question": "What is the capital of France?", "options": ["Paris", "London", "Berlin", "Madrid"], "correctAnswer": "Paris"}, {"question": "Explain the concept of gravity.", "correctAnswer": "Gravity is the force that attracts objects towards the center of the Earth."}]`;
    } else {
      return { error: "Invalid question type." };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates well-structured quizzes based on the meaningful content of the provided text.",
        },
        { role: "user", content: questionPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    console.log("OpenAI Response:", response);

    let rawText = response.choices[0]?.message?.content?.trim();
    if (!rawText) {
      console.error("❌ Invalid or empty response from OpenAI");
      return { error: "Received an empty or invalid response from OpenAI." };
    }

    // Remove markdown code blocks if present
    if (rawText.startsWith("```json"))
      rawText = rawText.replace(/^```json/, "").trim();
    if (rawText.endsWith("```")) rawText = rawText.replace(/```$/, "").trim();

    // Try parsing JSON safely
    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr);
      return { error: "Failed to parse quiz JSON from OpenAI response." };
    }

    // If previousQuestions provided, filter duplicates
    if (previousQuestions.length > 0 && Array.isArray(parsedQuiz)) {
      parsedQuiz = parsedQuiz.filter(
        (q) => !previousQuestions.includes(q.question)
      );
    }

    // If after filtering fewer questions than requested, retry
    if (
      Array.isArray(parsedQuiz) &&
      parsedQuiz.length < numberOfQuestions &&
      retries > 0
    ) {
      console.log(
        `⚠️ Filtered quiz has fewer questions (${parsedQuiz.length}) than requested (${numberOfQuestions}). Retrying... (${retries} attempts left)`
      );
      await new Promise((res) => setTimeout(res, delay));
      return generateQuizWithRetry(
        inputText,
        difficultyLevel,
        questionType,
        numberOfQuestions,
        retries - 1,
        delay * 2,
        previousQuestions
      );
    }

    return parsedQuiz.slice(0, numberOfQuestions);
  } catch (error) {
    console.error("❌ Error generating quiz:", error);
    if (retries > 0) {
      console.log(`🔄 Retrying... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, delay));
      return generateQuizWithRetry(
        inputText,
        difficultyLevel,
        questionType,
        numberOfQuestions,
        retries - 1,
        delay * 2,
        previousQuestions
      );
    }
    return { error: "Failed to generate quiz after multiple attempts." };
  }
};

export const detectQuizTopic = async (inputText) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You're a helpful assistant that identifies topics based on content.",
        },
        {
          role: "user",
          content: `Read the following content and return a one-word topic or subject (like English, Urdu, Math, Science, History):\n\n${inputText}`,
        },
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("❌ Failed to detect topic:", error.message);
    return "General";
  }
};
