import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    email: { type: String, unique: true },
    password: String,
    dob: Date,
    country: String,
    emailVerificationOtp: String,
    emailVerificationOtpExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model("TempUser", tempUserSchema);
