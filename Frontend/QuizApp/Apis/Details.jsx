import axios from "axios";

// Function to fetch user details
export const getUserDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); // Debug log

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get("http://localhost:3000/api/user/details", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

// Function to send OTP for current email verification
export const sendOtpToCurrentEmail = async () => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token for OTP request:", token); // Debug log

    if (!token) {
      throw new Error("No authentication token found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    console.log("Request config:", config); // Debug log

    const response = await axios.put(
      "http://localhost:3000/api/user/send-verify-email-otp",
      {},
      config
    );
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - Token might be invalid or expired");
      localStorage.removeItem("token");
      throw new Error("Session expired. Please login again.");
    }
    throw error.response?.data || { error: "Failed to send OTP" };
  }
};

// Function to verify current email OTP
export const verifyCurrentEmailOtp = async (otp) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token for OTP verification:", token); // Debug log

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      "http://localhost:3000/api/user/verify-current-email-otp",
      { otp },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - Token might be invalid or expired");
      localStorage.removeItem("token");
      throw new Error("Session expired. Please login again.");
    }
    throw error.response?.data || { error: "Failed to verify OTP" };
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

// Function to update password
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const token = localStorage.getItem("token");
    console.log("Token for password update:", token); // Debug log

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.put(
      "http://localhost:3000/api/user/update-password",
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    if (error.response?.status === 401) {
      console.log("401 Unauthorized - Token might be invalid or expired");
      localStorage.removeItem("token");
      throw new Error("Session expired. Please login again.");
    }
    throw error.response?.data || { error: "Failed to update password" };
  }
};
