import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Container,
  CircularProgress,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  School,
  TrendingUp,
  EmojiEvents,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { signIn, redirectToGoogleLogin } from "../../../Apis/SigninApi.jsx";

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const storeUserData = (token, userId) => {
    if (!token || !userId) {
      throw new Error("Invalid token or userId");
    }
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    console.log("Token stored:", token); // Debug log
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await signIn(formData);
      if (!data.token || !data.userId) {
        throw new Error("Invalid response from server");
      }
      storeUserData(data.token, data.userId);
      setUserData({ userId: data.userId });
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      console.error("Signin error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    redirectToGoogleLogin();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        storeUserData(token, userData._id);
        setUserData({ userId: userData._id });
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Error parsing user data:", err);
        setError("Invalid user data received");
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    // Trap the user on this page
    window.history.pushState(null, "", window.location.href);
    const handlePopState = (event) => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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
          alignItems: { xs: "center", md: "flex-start" },
          justifyContent: "center",
          gap: { xs: 4, md: 8 },
        }}
      >
        {/* Left Section - Title and Features */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "900px",
            display: "flex",
            marginTop: "1%",
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
              width: "100%",
              padding: "10px 0px",
            }}
          >
            Sign in to{" "}
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
            }}
          >
            Continue your journey with AI-powered quizzes. Create, share, and
            track your progress.
          </Typography>

          {/* Features List */}
          <Box sx={{ width: "100%" }}>
            {[
              {
                icon: <School sx={{ fontSize: 24, color: "#24A148" }} />,
                text: "Access your personalized quizzes",
              },
              {
                icon: <TrendingUp sx={{ fontSize: 24, color: "#24A148" }} />,
                text: "Track your learning progress",
              },
              {
                icon: <EmojiEvents sx={{ fontSize: 24, color: "#24A148" }} />,
                text: "Earn achievements and badges",
              },
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: index < 2 ? 2 : 0,
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
                <Typography
                  sx={{
                    fontSize: "1rem",
                    color: "#666",
                  }}
                >
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Section - Sign In Form */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "900px",
            width: "100%",
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: "16px",
              backgroundColor: "#fcfcfc",
              boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSignin}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
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
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#24A148" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
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
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#24A148" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ color: "#24A148" }} />
                        ) : (
                          <Visibility sx={{ color: "#24A148" }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={<Checkbox />}
                  label="Remember me"
                  sx={{ color: "#666" }}
                />
                <Button
                  onClick={() => navigate("/forgot-password")}
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
                  Forgot Password?
                </Button>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: "#24A148",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  mb: 2,
                  "&:hover": {
                    backgroundColor: "#1E8E3E",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={handleGoogleLogin}
                sx={{
                  borderColor: "rgba(0, 0, 0, 0.12)",
                  color: "#666",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textTransform: "none",
                  mb: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    borderColor: "rgba(0, 0, 0, 0.24)",
                  },
                }}
                startIcon={<Google />}
              >
                Sign in with Google
              </Button>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                  }}
                >
                  Don't have an account?
                </Typography>
                <Button
                  onClick={() => navigate("/signup")}
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
                  Sign up
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Signin;
