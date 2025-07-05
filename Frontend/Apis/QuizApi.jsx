import axios from "axios";

export const fetchQuizQuestions = async (quizId) => {
  try {
    const token = localStorage.getItem("token"); // Retrieve token

    if (!token) {
      throw new Error("Authorization token is missing. Please log in.");
    }

    const response = await axios.get(
      `http://localhost:3000/api/quiz/${quizId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);
    if (!response.data || !Array.isArray(response.data.questions)) {
      throw new Error("Invalid quiz format received.");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw new Error("Failed to load quiz.");
  }
};

//  Generate Quiz fucntion
export const generateQuiz = async (quizData) => {
  console.log("Original Quiz Data:", quizData);
  const token = localStorage.getItem("token");
  console.log("Token in Genrate Quiz", token);
  if (!token) {
    throw new Error("Authorization token is missing. Please log in.");
  }

  let requestData;
  let headers;

  if (quizData.inputType === "file") {
    requestData = new FormData();
    requestData.append("quizDuration", quizData.quizDuration);
    requestData.append("difficultyLevel", quizData.difficultyLevel);
    requestData.append("inputType", quizData.inputType);
    requestData.append("file", quizData.file);
    requestData.append("questionType", quizData.questionType); // Add questionType to FormData
    requestData.append("inputSource", quizData.inputSource); // Add questionType to FormData
    requestData.append("numberOfQuestions", quizData.numberOfQuestions); // ✅ Added here

    headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };
  } else {
    requestData = {
      quizDuration: parseInt(quizData.quizDuration, 10),
      difficultyLevel: quizData.difficultyLevel,
      questionType: quizData.questionType, // Send questionType as part of the JSON body
      inputType: quizData.inputType,
      inputSource: quizData.inputSource,
      numberOfQuestions: parseInt(quizData.numberOfQuestions, 10), // ✅ Added here
    };

    if (quizData.inputType === "text") {
      requestData.textInput = quizData.inputSource;
    } else if (quizData.inputType === "video") {
      requestData.selectedVideo = quizData.inputSource;
    } else if (quizData.inputType === "localVideo") {
      requestData.selectedLocalVideo = quizData.inputSource;
    }

    headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/quiz/create",
      requestData,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz.");
  }
};
