import express from "express";
import passport from "passport";
import {
  resendOtp,
  signinUser,
  signupUser,
  verifyEmailOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getUserDetails,
  updateUserPassword,
} from "../Controllers/UserController.js";
import { createToken } from "../Controllers/UserController.js"; // Token creation function

import mongoose from "mongoose";
import User from "../Models/UserModel.js";
import { sendOtpEmail } from "../Utils/sendEmail.js";
const userRouter = express.Router();

// Signin route
userRouter.post("/signin", signinUser);

// Signup route
userRouter.post("/signup", signupUser);

// OTP Verification route
userRouter.post("/verify-otp", verifyEmailOtp);

// Resend OTP route
userRouter.post("/resend-otp", resendOtp);

// Google OAuth login route
userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Google OAuth callback route
userRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful login
    const token = createToken(req.user._id); // Generate JWT
    const user = encodeURIComponent(JSON.stringify(req.user)); // Encode user data to avoid issues
    res.redirect(`http://localhost:5173/dashboard?token=${token}&user=${user}`);
  }
);

// Logout route
userRouter.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        return res.status(500).json({ message: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.status(200).json({ message: "Logout successful" });
    });
  });
});

// Example of an Express route for OTP verification
userRouter.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Verify OTP logic here (check the database or cache)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark the user as verified and complete registration
    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: "OTP verified successfully. Registration complete!",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
userRouter.get(
  "/details",
  passport.authenticate("jwt", { session: false }), // Passport JWT middleware
  getUserDetails
);

userRouter.put(
  "/send-verify-email-otp",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      user.emailVerificationOtp = otp;
      user.emailVerificationOtpExpires = otpExpiry;
      user.isEmailVerifiedForChange = false;

      await user.save();
      await sendOtpEmail(user.email, otp);

      res
        .status(200)
        .json({ message: "OTP sent to your current email address." });
    } catch (err) {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  }
);

// Route to request OTP for email update
userRouter.put(
  "/verify-current-email-otp",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { otp } = req.body;
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      console.log("User email OTP:", user.emailVerificationOtp);
      console.log("User OTP input:", otp);

      if (user.emailVerificationOtp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      if (new Date() > user.emailVerificationOtpExpires) {
        return res.status(400).json({ error: "OTP has expired" });
      }

      // Set flag true
      user.isEmailVerifiedForChange = true;
      console.log("Setting isEmailVerifiedForChange to true");
      user.emailVerificationOtp = undefined;
      user.emailVerificationOtpExpires = undefined;

      // Save user with updated flag
      await user.save();

      // Reload the user from DB to verify flag
      const updatedUser = await User.findById(userId);
      console.log("Updated User after OTP verification:", updatedUser);

      res.status(200).json({
        message: "Current email verified. You can now update your email.",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  }
);

// Route to verify OTP and update email
userRouter.put(
  "/update-email",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { newEmail } = req.body;
    const userId = req.user._id;

    try {
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(newEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Reload the user to ensure we get the updated data
      const user = await User.findById(userId);
      console.log("User before checking flag:", user);

      if (!user) return res.status(404).json({ error: "User not found" });

      // Check if the email change flag is set to true
      console.log(
        "User isEmailVerifiedForChange:",
        user.isEmailVerifiedForChange
      );

      if (!user.isEmailVerifiedForChange) {
        return res
          .status(403)
          .json({ error: "Verify your current email first" });
      }

      // Proceed with updating the email
      user.email = newEmail;
      user.isEmailVerifiedForChange = false; // Reset flag after successful change
      await user.save();

      res.status(200).json({ message: "Email updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update email" });
    }
  }
);

// Route to update password
userRouter.put(
  "/update-password",
  passport.authenticate("jwt", { session: false }),
  updateUserPassword
);
// Forgot Password routes
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-reset-otp", verifyResetOtp);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
