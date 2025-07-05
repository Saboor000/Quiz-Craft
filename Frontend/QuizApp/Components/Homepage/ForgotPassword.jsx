import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "signin";

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Email validation
    if (!formData.email.trim()) {
      setErrors({ email: "Email is required" });
      setLoading(false);
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: "Please enter a valid email address" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/user/forgot-password`,
        { email: formData.email }
      );
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      if (error.response) {
        setErrors({ email: error.response.data.message });
      } else {
        setErrors({ email: "An error occurred. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!formData.otp) {
      setErrors({ otp: "OTP is required" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/user/verify-reset-otp`,
        { email: formData.email, otp: formData.otp }
      );
      setMessage(response.data.message);
      setOtpVerified(true);
    } catch (error) {
      if (error.response) {
        setErrors({ otp: error.response.data.message });
      } else {
        setErrors({ otp: "An error occurred. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Password validation
    if (!formData.newPassword) {
      setErrors({ newPassword: "Password is required" });
      setLoading(false);
      return;
    } else if (formData.newPassword.length < 8) {
      setErrors({ newPassword: "Password must be at least 8 characters" });
      setLoading(false);
      return;
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(
        formData.newPassword
      )
    ) {
      setErrors({
        newPassword:
          "Password must have 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      });
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({
        newPassword: "Passwords do not match",
        confirmPassword: "Passwords do not match",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/user/reset-password`,
        {
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }
      );
      setMessage(response.data.message);
      setShowSuccessDialog(true);
      setTimeout(() => {
        handleResetSuccess();
      }, 2000);
    } catch (error) {
      if (error.response) {
        setErrors({ newPassword: error.response.data.message });
      } else {
        setErrors({ newPassword: "An error occurred. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSuccess = () => {
    if (redirect === "profile") {
      navigate("/profile");
    } else {
      navigate("/signin");
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
        background: "#F8F9FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 4,
            borderRadius: "16px",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              textAlign: "center",
              fontWeight: 600,
              color: "#1a1b2e",
            }}
          >
            {otpVerified
              ? "Reset Your Password"
              : otpSent
              ? "Verify Your Email"
              : "Forgot Password"}
          </Typography>

          {message && (
            <Alert severity={otpVerified ? "success" : "info"} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp}>
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
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
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : !otpVerified ? (
            <form onSubmit={handleVerifyOtp}>
              <TextField
                fullWidth
                label="Enter OTP"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                error={!!errors.otp}
                helperText={errors.otp}
                required
                sx={textFieldStyles}
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
                disabled={loading}
                sx={{
                  mt: 3,
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
                  "Verify OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
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
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                sx={{ ...textFieldStyles, mt: 2 }}
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
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
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: "#666" }}>
              Remember your password?
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
        </Paper>
      </Box>
      <Dialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          handleResetSuccess();
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: "black", fontWeight: 700 }}>
          Password Reset Successful
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "black", fontWeight: 500 }}>
            Your password has been reset successfully!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSuccessDialog(false);
              handleResetSuccess();
            }}
            sx={{
              color: "#fff",
              backgroundColor: "#24A148",
              "&:hover": { backgroundColor: "#1E8E3E" },
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
            variant="contained"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ForgotPassword;
