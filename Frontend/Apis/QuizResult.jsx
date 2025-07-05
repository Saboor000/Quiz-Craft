import axios from "axios";

// Fetch quiz result by quizId and userId
export const fetchQuizResult = async (quizId, userId) => {
  const response = await axios.get(`/api/submit/${quizId}/result/${userId}`);
  return response.data;
};

// Fetch today's quiz activity by userId
export const fetchTodaysActivity = async (userId) => {
  const response = await axios.get(`/api/submit/activity/today/${userId}`);
  return response.data;
};

/**
 * Fetch total quizzes this month and last month
 * Calculate growth percentage
 */
export const fetchMonthlyQuizStats = async (userId) => {
  try {
    const response = await axios.get(
      `/api/submit/activity/monthly-progress/${userId}`
    );
    const { thisMonthCount, lastMonthCount } = response.data;

    let change = 0;
    if (lastMonthCount === 0 && thisMonthCount > 0) {
      change = 100;
    } else if (lastMonthCount === 0 && thisMonthCount === 0) {
      change = 0;
    } else {
      change = (
        ((thisMonthCount - lastMonthCount) / lastMonthCount) *
        100
      ).toFixed(2);
    }
    console.log("📅 Raw Monthly Stats Response:", response.data);
    return {
      totalQuizzes: thisMonthCount,
      percentageChange: change,
    };
  } catch (error) {
    console.error("Error fetching monthly quiz stats:", error);
    return {
      totalQuizzes: 0,
      percentageChange: 0,
    };
  }
};

// Fetch performance analytics by userId
export const fetchPerformanceAnalytics = async (userId) => {
  try {
    const response = await axios.get(`/api/submit/performance/${userId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching performance analytics:", error);
    return {
      completionRate: 0,
      scoreDistribution: {
        excellent: 0,
        good: 0,
        needsImprovement: 0,
      },
    };
  }
};

export const getOverallPerformance = async (userId) => {
  console.log("📤 Sending request to /api/submit/performance/overall/", userId);
  try {
    const response = await axios.get(
      `/api/submit/performance/overall/${userId}`
    );
    console.log("✅ Got response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching overall performance:", error);
    throw new Error("Failed to fetch overall performance.");
  }
};

// Recent Quizzess
export const getRecentQuizAttempts = async (userId) => {
  try {
    const token = localStorage.getItem("token"); // Get the auth token

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`/api/submit/recent-attempts/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching recent quiz attempts:", error);
    if (error.response?.status === 401) {
      // Handle unauthorized error - maybe redirect to login
      console.log("User unauthorized, might need to login again");
    }
    return []; // Return empty array on error
  }
};
export const getAllQuizAttempts = async (userId) => {
  try {
    const token = localStorage.getItem("token"); // Get the auth token

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`/api/submit/all-attempts/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Ensure we return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching recent quiz attempts:", error);
    if (error.response?.status === 401) {
      // Handle unauthorized error - maybe redirect to login
      console.log("User unauthorized, might need to login again");
    }
    return []; // Return empty array on error
  }
};
