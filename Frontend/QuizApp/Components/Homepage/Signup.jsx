import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Person,
  Phone,
  CalendarToday,
  Public,
  School,
  TrendingUp,
  EmojiEvents,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { handleSignup, verifyOtp, resendOtp } from "../../../Apis/SignupApi";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phonenumber: "",
    dob: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone number validation
    if (name === "phonenumber") {
      // Remove any non-digit characters
      const cleanedValue = value.replace(/\D/g, "");

      // Check if it starts with '03' and has correct length
      if (cleanedValue.length > 0 && !cleanedValue.startsWith("03")) {
        setErrors({
          ...errors,
          phonenumber: "Phone number must start with 03",
        });
      } else if (cleanedValue.length > 0 && cleanedValue.length !== 11) {
        setErrors({ ...errors, phonenumber: "Phone number must be 11 digits" });
      } else {
        setErrors({ ...errors, phonenumber: "" });
      }

      // Update the value with cleaned number
      setFormData({ ...formData, [name]: cleanedValue });
      return;
    }

    // DOB validation
    if (name === "dob") {
      const selectedDate = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 100); // 100 years ago
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 13); // 13 years ago

      if (selectedDate > maxDate) {
        setErrors({ ...errors, dob: "You must be at least 13 years old" });
      } else if (selectedDate < minDate) {
        setErrors({ ...errors, dob: "Please enter a valid date of birth" });
      } else {
        setErrors({ ...errors, dob: "" });
      }
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (errors.otp) {
      setErrors({ ...errors, otp: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate all fields
    const newErrors = {};

    // First Name validation
    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required";
    } else if (formData.firstname.length < 2) {
      newErrors.firstname = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    } else if (formData.lastname.length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone number validation
    if (!formData.phonenumber) {
      newErrors.phonenumber = "Phone number is required";
    } else if (!/^03\d{9}$/.test(formData.phonenumber)) {
      newErrors.phonenumber =
        "Phone number must be in Pakistani format (03XXXXXXXXX)";
    }

    // DOB validation
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 13); // 13 years ago
      const maxAgeDate = new Date();
      maxAgeDate.setFullYear(today.getFullYear() - 100); // 100 years ago

      if (isNaN(dobDate.getTime())) {
        newErrors.dob = "Invalid date of birth";
      } else if (dobDate > minAgeDate) {
        newErrors.dob = "You must be at least 13 years old";
      } else if (dobDate < maxAgeDate) {
        newErrors.dob = "Please enter a valid date of birth";
      }
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must have 1 uppercase, 1 lowercase, 1 number, and 1 special character";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      newErrors.password = "Passwords do not match";
    }

    // If there are any errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await handleSignup(e, formData, setErrors, setOtpSent);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setVerificationLoading(true);
    try {
      const successMessage = await verifyOtp(formData.email, otp, setErrors);
      setMessage(successMessage);
      setVerificationSuccess(true);
      // Wait for 2 seconds before redirecting
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      // Error is already handled in verifyOtp
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setVerificationLoading(true);
    try {
      await resendOtp(formData.email, setMessage, setErrors);
    } finally {
      setVerificationLoading(false);
    }
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      height: "50px",
      backgroundColor: "#fff",
      "& fieldset": {
        borderColor: "rgba(0, 0, 0, 0.1)",
      },
      "&:hover fieldset": {
        borderColor: "#24A148",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#24A148",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#666",
      fontSize: "0.9rem",
      transform: "translate(14px, 12px)",
      "&.Mui-focused": {
        color: "#24A148",
      },
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -9px) scale(0.75)",
      },
    },
    "& .MuiInputAdornment-root": {
      marginRight: "8px",
      "& .MuiSvgIcon-root": {
        fontSize: "20px",
        color: "#24A148",
      },
    },
    "& input": {
      padding: "12px 14px",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#fdfdfd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 4, md: 8 },
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "500px",
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "2rem", sm: "2.5rem" },
              color: "#1a1b2e",
              mb: 2,
              padding: "10px 0px",
            }}
          >
            Sign up to{" "}
            <Box component="span" sx={{ color: "#24A148" }}>
              QGC
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: "1.1rem",
              color: "#666",
              mb: 4,
              maxWidth: "440px",
            }}
          >
            Start your journey with AI-powered quizzes. Create, share, and track
            your progress.
          </Typography>

          {/* Features */}
          <Box sx={{ width: "100%" }}>
            {[
              {
                icon: <School sx={{ fontSize: 24, color: "#24A148" }} />,
                text: "Create personalized quizzes",
              },
              {
                icon: <TrendingUp sx={{ fontSize: 24, color: "#24A148" }} />,
                text: "AI-powered question generation",
              },
              {
                icon: <EmojiEvents sx={{ fontSize: 24, color: "#24A148" }} />,
                text: "Detailed performance analytics",
              },
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                  padding: "5px 0px",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: "rgba(36, 161, 72, 0.1)",
                    borderRadius: "8px",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {feature.icon}
                </Paper>
                <Typography sx={{ fontSize: "1rem", color: "#666" }}>
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Section - Form */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "100%",
            width: "100%",
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 4,
              borderRadius: "16px",
              backgroundColor: "#fcfcfc",
              boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {otpSent ? (
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#1a1b2e",
                  }}
                >
                  {verificationSuccess
                    ? "Email Verified!"
                    : "Verify Your Email"}
                </Typography>
                {!verificationSuccess && (
                  <Typography
                    variant="body1"
                    sx={{ mb: 3, textAlign: "center", color: "#666" }}
                  >
                    We've sent a verification code to {formData.email}
                  </Typography>
                )}
                {verificationSuccess ? (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {message}
                  </Alert>
                ) : (
                  <form onSubmit={handleOtpSubmit}>
                    <TextField
                      fullWidth
                      label="Enter OTP"
                      value={otp}
                      onChange={handleOtpChange}
                      error={!!errors.otp}
                      helperText={errors.otp}
                      required
                      sx={{
                        mb: 2,
                        ...textFieldStyles,
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={verificationLoading}
                      sx={{
                        mb: 2,
                        height: "48px",
                        backgroundColor: "#24A148",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#1E8E3E",
                        },
                      }}
                    >
                      {verificationLoading ? (
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleResendOtp}
                      disabled={verificationLoading}
                      sx={{
                        mb: 3,
                        height: "48px",
                        borderColor: "rgba(0, 0, 0, 0.12)",
                        color: "#666",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        fontWeight: 500,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          borderColor: "rgba(0, 0, 0, 0.24)",
                        },
                      }}
                    >
                      Resend OTP
                    </Button>
                    {message && !verificationSuccess && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {message}
                      </Alert>
                    )}
                  </form>
                )}
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2.5} xs={12} sm={6}>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      error={!!errors.firstname}
                      helperText={errors.firstname}
                      required
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      error={!!errors.lastname}
                      helperText={errors.lastname}
                      required
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleChange}
                      error={!!errors.phonenumber}
                      helperText={errors.phonenumber || "Format: 03XXXXXXXXX"}
                      required
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      error={!!errors.dob}
                      helperText={
                        errors.dob || "You must be at least 13 years old"
                      }
                      required
                      InputLabelProps={{ shrink: true }}
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{
                        max: new Date(
                          new Date().setFullYear(new Date().getFullYear() - 13)
                        )
                          .toISOString()
                          .split("T")[0],
                        min: new Date(
                          new Date().setFullYear(new Date().getFullYear() - 100)
                        )
                          .toISOString()
                          .split("T")[0],
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      error={!!errors.country}
                      helperText={errors.country}
                      required
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Public />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      required
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ marginRight: "-12px" }}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} width={"47%"}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      required
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              sx={{ marginRight: "-12px" }}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 4,
                    mb: 2,
                    height: "48px",
                    backgroundColor: "#24A148",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#1E8E3E",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/signin")}
                  sx={{
                    mb: 3,
                    height: "48px",
                    borderColor: "rgba(0, 0, 0, 0.12)",
                    color: "#666",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: 500,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                      borderColor: "rgba(0, 0, 0, 0.24)",
                    },
                  }}
                  startIcon={<Google />}
                >
                  Sign up with Google
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Already have an account?
                  </Typography>
                  <Button
                    onClick={() => navigate("/signin")}
                    sx={{
                      textTransform: "none",
                      color: "#24A148",
                      fontWeight: 500,
                      p: 0,
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: "#1E8E3E",
                      },
                    }}
                  >
                    Sign in
                  </Button>
                </Box>
              </form>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;
