import User from "../Models/UserModel.js";
import TempUser from "../Models/TempUser.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../Utils/sendEmail.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const createToken = (id) => {
  try {
    const secret = process.env.SECRET;
    return jwt.sign({ id }, secret, { expiresIn: "3d" });
  } catch (error) {
    console.error("Error creating token:", error);
    throw new Error("Failed to create authentication token");
  }
};

// Signup Controller
export const signupUser = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    password,
    confirmPassword,
    dob,
    country,
    phonenumber,
  } = req.body;

  try {
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword ||
      !dob ||
      !country ||
      !phonenumber
    ) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Phone number validation
    if (!/^03\d{9}$/.test(phonenumber)) {
      throw new Error("Phone number must be in Pakistani format (03XXXXXXXXX)");
    }

    // DOB validation
    const dobDate = new Date(dob);
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 13); // 13 years ago
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(today.getFullYear() - 100); // 100 years ago

    if (isNaN(dobDate.getTime())) {
      throw new Error("Invalid date of birth");
    }

    if (dobDate > minAgeDate) {
      throw new Error("You must be at least 13 years old");
    }

    if (dobDate < maxAgeDate) {
      throw new Error("Please enter a valid date of birth");
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(
        password
      )
    ) {
      throw new Error(
        "Password must have 1 uppercase, 1 lowercase, 1 number, 1 special character and 8 characters minimum."
      );
    }

    const existingUser = await User.findOne({ email });
    const existingTempUser = await TempUser.findOne({ email });

    if (existingUser || existingTempUser) {
      throw new Error("Email is already registered or pending verification");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 min validity

    await TempUser.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      dob,
      country,
      emailVerificationOtp: otp,
      emailVerificationOtpExpires: otpExpiry,
    });

    await sendOtpEmail(email, otp);

    res.status(201).json({
      message:
        "Signup successful! An OTP has been sent to your email for verification.",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Signin Controller
export const signinUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.signin(email, password);

    const token = createToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Verify Email OTP Controller
export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) {
      return res
        .status(400)
        .json({ error: "No pending registration found for this email" });
    }

    if (tempUser.emailVerificationOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (tempUser.emailVerificationOtpExpires < new Date()) {
      return res
        .status(400)
        .json({ error: "OTP expired, please signup again" });
    }

    const user = await User.create({
      firstname: tempUser.firstname,
      lastname: tempUser.lastname,
      email: tempUser.email,
      password: tempUser.password,
      dob: tempUser.dob,
      country: tempUser.country,
      isEmailVerified: true,
    });

    await tempUser.deleteOne(); // Clean temp user after success

    res
      .status(200)
      .json({ message: "Email verified and account created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Resend OTP Controller
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });

    if (!tempUser) {
      return res
        .status(400)
        .json({ error: "No signup in progress for this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    tempUser.emailVerificationOtp = otp;
    tempUser.emailVerificationOtpExpires = otpExpiry;
    await tempUser.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP resent to your email" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update user with OTP
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = otpExpiry;
    await user.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "saboorsamad010@gmail.com",
        pass: process.env.EMAIL_PASS || "uitkpfxehuzgfgeu",
      },
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER || "saboorsamad010@gmail.com",
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Please use the following OTP to verify your identity:</p>
        <h3>${otp}</h3>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify Reset OTP
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if email and OTP are provided
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (
      user.resetPasswordOtp !== otp ||
      user.resetPasswordOtpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Check if all fields are provided
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (
      user.resetPasswordOtp !== otp ||
      user.resetPasswordOtpExpiry < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserDetails = async (req, res) => {
  try {
    if (!req.user) {
      console.error("No user found in request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      console.error("User not found with ID:", req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserDetails:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Ensure both currentPassword and newPassword are provided
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    // Find user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current password matches the stored password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updateUserPassword:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
};
export {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getUserDetails,
  updateUserPassword,
};
