// src/api/user.js
import axios from "axios";

export const getUserDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage");
      return null;
    }

    const response = await axios.get("http://localhost:3000/api/user/details", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

export const sendOtpToCurrentEmail = async (token) => {
  try {
    const res = await axios.put(
      "http://localhost:3000/api/user/send-verify-email-otp",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert(res.data.message); // or show a toast
  } catch (error) {
    alert(error.response?.data?.error || "Failed to send OTP");
  }
};

export const verifyCurrentEmailOtp = async (otp, token) => {
  try {
    const res = await axios.put(
      "http://localhost:3000/api/user/verify-current-email-otp",
      { otp },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert(res.data.message);
    return true;
  } catch (error) {
    alert(error.response?.data?.error || "OTP verification failed");
    return false;
  }
};

// Function to update email
export const updateUserEmail = async (newEmail) => {
  try {
    const token = localStorage.getItem("token");
    console.log("[DEBUG] Token for email update:", token); // Debug log

    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    console.log("[DEBUG] Request headers for update email:", headers); // Debug log

    const response = await axios.put(
      "http://localhost:3000/api/user/update-email",
      { newEmail },
      { headers }
    );

    // Return a consistent response format
    return {
      success: true,
      message: response.data.message || "Email updated successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating email:", error);
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - Token might be invalid or expired");
      localStorage.removeItem("token");
      throw new Error("Session expired. Please login again.");
    }
    throw error.response?.data || { error: "Failed to update email" };
  }
};

export const updatePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(
      "http://localhost:3000/api/user/update-password",
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Something went wrong" };
  }
};
