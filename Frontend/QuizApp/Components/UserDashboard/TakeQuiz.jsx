import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CssBaseline,
  Paper,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  Chip,
  Fade,
  Zoom,
  Slide,
  Grow,
} from "@mui/material";
import {
  Timer,
  Quiz,
  ArrowBack,
  HelpOutline,
  Info,
  Person,
  CheckCircle,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { submitQuizAnswers } from "../../../Apis/SubmitApi";
import { fetchQuizQuestions } from "../../../Apis/QuizApi";
import DashboardHeader from "./DashboardHeader";

const TakeQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId: paramQuizId } = useParams();
  const {
    quizId = paramQuizId || localStorage.getItem("quizId"),
    quizDuration = 10,
    quizTopic = "Quiz",
  } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quizDuration * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [quizTitle, setQuizTitle] = useState(quizTopic);

  useEffect(() => {
    if (!quizId) {
      setError("❌ Quiz ID is missing.");
      setLoading(false);
      return;
    }

    // Prevent navigation away (back/forward/refresh)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Prevent browser back/forward
    const handlePopState = (event) => {
      event.preventDefault();
      const confirmLeave = window.confirm(
        "Are you sure you want to quit? Your progress will be lost."
      );
      if (confirmLeave) {
        navigate("/dashboard");
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);

    const loadQuiz = async () => {
      try {
        setLoading(true);
        const data = await fetchQuizQuestions(quizId);

        if (
          data &&
          Array.isArray(data.questions) &&
          data.questions.length > 0
        ) {
          const formattedQuestions = data.questions.map((question) => ({
            ...question,
            type:
              question.options && question.options.length > 0
                ? "mcq"
                : "open-ended",
          }));
          setQuestions(formattedQuestions);

          if (data.quizTitle) {
            setQuizTitle(data.quizTitle);
          }
        } else {
          throw new Error(
            "Invalid quiz data received or no questions available."
          );
        }
      } catch (err) {
        setError(err.response?.data?.message || "❌ Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [quizId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const answeredCount = Object.keys(userAnswers).length;
    setProgress((answeredCount / questions.length) * 100);
  }, [userAnswers, questions.length]);

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

  const handleAnswerChange = (questionIndex, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("❌ Please log in to submit the quiz.");
      return;
    }

    try {
      setLoading(true);
      // Always submit an answer for every question (empty string if unanswered)
      const answers = questions.map((_, idx) => userAnswers[idx] ?? "");
      const response = await submitQuizAnswers(quizId, answers, userId);
      navigate(`/quiz-result/${quizId}/${userId}`);
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to submit quiz.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#fdfdfd",
        }}
      >
        <Fade in={true} timeout={500}>
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: "#24A148", mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: "#1a1b2e" }}>
              Loading Quiz...
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#fdfdfd",
        }}
      >
        <Fade in={true} timeout={500}>
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
        </Fade>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fdfdfd",
        position: "relative",
      }}
    >
      <DashboardHeader
        title={quizTitle}
        timer={timeLeft}
        showNavButtons={false}
        onBack={() => navigate(-1)}
        showProfile={false}
      />
      {/* Progress Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          height: "4px",
          backgroundColor: "rgba(36, 161, 72, 0.1)",
          zIndex: 1100,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: "100%",
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#24A148",
              transition: "transform 0.5s ease",
            },
          }}
        />
      </Box>
      {/* Main Content */}
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fdfdfd",
        }}
      >
        {questions.length > 0 && (
          <Slide
            direction="up"
            in={true}
            mountOnEnter
            unmountOnExit
            timeout={500}
          >
            <Paper
              sx={{
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.7)",
                overflow: "hidden",
                bgcolor: "#fcfcfc",
                transition: "all 0.3s ease",
                p: 4,
                mt: 10,
                mb: 0,
                width: "100%",
                maxWidth: 900,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0px 3px 4px rgba(0,0,0,0.9)",
                },
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#666666",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Info sx={{ color: "#24A148" }} />
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "#212b36",
                    fontWeight: "bold",
                    mb: 3,
                  }}
                >
                  {questions[currentQuestionIndex].question}
                </Typography>
              </Box>
              {questions[currentQuestionIndex].type === "mcq" ? (
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <RadioGroup
                    value={userAnswers[currentQuestionIndex] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestionIndex, e.target.value)
                    }
                  >
                    {questions[currentQuestionIndex].options.map(
                      (option, index) => (
                        <Grow in={true} timeout={500 + index * 100} key={index}>
                          <FormControlLabel
                            value={option}
                            control={
                              <Radio
                                icon={<RadioButtonUnchecked />}
                                checkedIcon={<RadioButtonChecked />}
                                sx={{
                                  color: "#24A148",
                                  "&.Mui-checked": {
                                    color: "#24A148",
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  color: "#212b36",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    color: "#24A148",
                                  },
                                }}
                              >
                                {option}
                              </Typography>
                            }
                            sx={{
                              mb: 2,
                              p: 1,
                              borderRadius: 2,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: "rgba(36, 161, 72, 0.05)",
                              },
                            }}
                          />
                        </Grow>
                      )
                    )}
                  </RadioGroup>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={userAnswers[currentQuestionIndex] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestionIndex, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#24A148",
                        },
                      },
                      "&.Mui-focused": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#24A148",
                        },
                      },
                    },
                  }}
                />
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 4,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  startIcon={<ArrowBack />}
                  sx={{
                    borderColor: "#24A148",
                    color: "#24A148",
                    "&:hover": {
                      borderColor: "#1E8E3E",
                      backgroundColor: "rgba(36, 161, 72, 0.08)",
                    },
                    "&:disabled": {
                      borderColor: "rgba(0, 0, 0, 0.12)",
                      color: "rgba(0, 0, 0, 0.26)",
                    },
                  }}
                >
                  Previous
                </Button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    endIcon={
                      loading ? <CircularProgress size={20} /> : <CheckCircle />
                    }
                    sx={{
                      backgroundColor: "#24A148",
                      "&:hover": {
                        backgroundColor: "#1E8E3E",
                      },
                      "&:disabled": {
                        backgroundColor: "rgba(0, 0, 0, 0.12)",
                      },
                    }}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                    sx={{
                      backgroundColor: "#24A148",
                      "&:hover": {
                        backgroundColor: "#1E8E3E",
                      },
                    }}
                  >
                    Next Question
                  </Button>
                )}
              </Box>
            </Paper>
          </Slide>
        )}
      </Box>
    </Box>
  );
};

export default TakeQuiz;
