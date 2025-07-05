// src/api/user.js
import axios from "axios";

export const handleForgotPassword = async (email, setMessage, setErrors) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/user/forgot-password`,
      { email }
    );
    setMessage(response.data.message);
    return response.data;
  } catch (error) {
    if (error.response) {
      setErrors({ email: error.response.data.message });
    } else {
      setErrors({ email: "An error occurred. Please try again." });
    }
    throw error;
  }
};

export const verifyResetOtp = async (email, otp, setMessage, setErrors) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/user/verify-reset-otp`,
      { email, otp }
    );
    setMessage(response.data.message);
    return response.data;
  } catch (error) {
    if (error.response) {
      setErrors({ otp: error.response.data.message });
    } else {
      setErrors({ otp: "An error occurred. Please try again." });
    }
    throw error;
  }
};

export const resetPassword = async (
  email,
  otp,
  newPassword,
  setMessage,
  setErrors
) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/user/reset-password`,
      { email, otp, newPassword }
    );
    setMessage(response.data.message);
    return response.data;
  } catch (error) {
    if (error.response) {
      setErrors({ newPassword: error.response.data.message });
    } else {
      setErrors({ newPassword: "An error occurred. Please try again." });
    }
    throw error;
  }
};
