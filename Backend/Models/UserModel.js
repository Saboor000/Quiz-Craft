import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    isEmailVerified: { type: Boolean, default: false },

    emailVerificationOtp: { type: String },
    emailVerificationOtpExpires: { type: Date },

    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },

    isEmailVerifiedForChange: {
      type: Boolean,
      default: false, // Default value to false if not explicitly set
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      validate: async function (value) {
        if (this.googleId) return true;
        if (value && value.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        return true;
      },
    },

    googleId: { type: String, unique: true, sparse: true },

    dob: {
      type: Date,
      required: function () {
        return !this.googleId;
      },
    },
    country: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
  },
  { timestamps: true }
);

// Static signup method
// userSchema.statics.signup = async function ({
//   firstname,
//   lastname,
//   email,
//   password,
//   confirmPassword,
//   dob,
//   country,
// }) {
//   if (
//     !firstname ||
//     !lastname ||
//     !email ||
//     !password ||
//     !confirmPassword ||
//     !dob ||
//     !country
//   ) {
//     throw new Error("All fields are required");
//   }

//   if (!validator.isStrongPassword(password)) {
//     throw new Error(
//       "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
//     );
//   }

//   if (password !== confirmPassword) {
//     throw new Error("Passwords do not match");
//   }

//   const existingUser = await this.findOne({ email });
//   if (existingUser) {
//     throw new Error("Email is already registered");
//   }

//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   // Generate 6-digit OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   const otpExpiry = new Date();
//   otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // expires in 10 min

//   const user = await this.create({
//     firstname,
//     lastname,
//     email,
//     password: hashedPassword,
//     dob,
//     country,
//     emailVerificationOtp: otp,
//     emailVerificationOtpExpires: otpExpiry,
//     isEmailVerified: false,
//   });

//   return user;
// };

// Static signin method
userSchema.statics.signin = async function (email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  if (!user.googleId) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }
  }

  return user;
};

export default mongoose.model("User", userSchema);
