import axios from "axios";

// Submit quiz answers
export const submitQuizAnswers = async (quizId, userAnswers, userId) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/submit/${quizId}`,
      { userAnswers, userId }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting answers:", error);
    throw new Error("Failed to submit quiz answers.");
  }
};
