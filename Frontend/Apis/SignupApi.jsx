// src/signupHandler.js
import axios from "axios";

// Signup Handler
export const handleSignup = async (e, formData, setErrors, setOtpSent) => {
  e.preventDefault();

  setErrors({});

  if (formData.password !== formData.confirmPassword) {
    setErrors({
      password: "Passwords do not match",
      confirmPassword: "Passwords do not match",
    });
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/signup",
      formData
    );
    console.log("Signup successful:", response.data);
    setOtpSent(true); // Show OTP input on frontend
  } catch (err) {
    console.error("Signup error:", err.response?.data || err.message);
    setErrors((prevErrors) => {
      const newErrors = {};
      if (err.response?.data?.error) {
        if (err.response.data.error.includes("Password must have")) {
          newErrors.password = err.response.data.error;
          newErrors.confirmPassword = err.response.data.error;
        } else {
          newErrors.email = err.response.data.error;
        }
      }
      if (err.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach((field) => {
          newErrors[field] = err.response.data.errors[field].message;
        });
      }
      return newErrors;
    });
  }
};

// OTP Verification Handler
export const verifyOtp = async (email, otp, setErrors, navigate) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/verify-otp",
      { email, otp }
    );
    console.log("OTP Verified:", response.data);
    // Return the success message instead of navigating directly
    return response.data.message;
  } catch (err) {
    console.error("OTP Verification error:", err.response?.data || err.message);
    setErrors({ otp: err.response?.data?.error || "Invalid OTP" });
    throw err;
  }
};

// Resend OTP Handler
export const resendOtp = async (email, setMessage, setErrors) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/user/resend-otp",
      { email }
    );
    console.log("OTP resent:", response.data);
    setMessage("OTP resent to your email");
  } catch (err) {
    console.error("Resend OTP error:", err.response?.data || err.message);
    setErrors({ resend: err.response?.data?.error || "Failed to resend OTP" });
  }
};
