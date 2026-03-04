import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";
import { fetchQuizResult } from "../../../Apis/QuizResult.jsx";
import DashboardHeader from "./DashboardHeader";

const QuizResult = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuizData = async () => {
      if (!quizId || !userId) {
        setError("Quiz ID or User ID is missing");
        setLoading(false);
        return;
      }

      try {
        const resultData = await fetchQuizResult(quizId, userId);
        setQuizResult(resultData);
      } catch (error) {
        setError(error.message || "Failed to load quiz result");
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [quizId, userId]);

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

  const handleBackToDashboard = () => {
    navigate("/dashboard");
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
        <CircularProgress sx={{ color: "#24A148" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fdfdfd",
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={handleBackToDashboard}
          startIcon={<ArrowBackIcon />}
          sx={{
            mt: 2,
            backgroundColor: "#24A148",
            "&:hover": { backgroundColor: "#1E8E3E" },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!quizResult) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fdfdfd",
        }}
      >
        <Typography variant="h6" gutterBottom>
          No result found
        </Typography>
        <Button
          variant="contained"
          onClick={handleBackToDashboard}
          startIcon={<ArrowBackIcon />}
          sx={{
            mt: 2,
            backgroundColor: "#24A148",
            "&:hover": { backgroundColor: "#1E8E3E" },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fdfdfd",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DashboardHeader
        title="Quiz Result"
        showNavButtons={false}
        showProfile={false}
        onBack={handleBackToDashboard}
      />
      {/* Main Content */}
      <Box
        sx={{
          paddingTop: "80px",
          bgcolor: "#fdfdfd",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: "#fdfdfd",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            width: "100%",
            maxWidth: 900,
            margin: "0 auto",
            mb: 5,
          }}
        >
          {/* Score Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: "#fcfcfc",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#666666" }}
                  >
                    Score
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{ color: "#24A148", fontWeight: "bold" }}
                  >
                    {quizResult.percentage}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666666", mt: 1 }}>
                    {quizResult.score} out of {quizResult.totalQuestions}{" "}
                    correct
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  bgcolor: "#fcfcfc",
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#666666" }}
                  >
                    Improvement
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      color:
                        quizResult.improvement >= 0 ? "#24A148" : "#d32f2f",
                      fontWeight: "bold",
                    }}
                  >
                    {quizResult.improvement >= 0 ? "+" : ""}
                    {quizResult.improvement}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666666", mt: 1 }}>
                    {quizResult.improvement >= 0
                      ? "Improvement from previous average"
                      : "Decrease from previous average"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Questions and Answers */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: "#1a1b2e", mb: 3 }}
          >
            Questions & Answers
          </Typography>

          <List>
            {quizResult.answers.map((answer, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  bgcolor: "#fcfcfc",
                }}
              >
                <CardContent>
                  <Box
                    sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                  >
                    <ListItemIcon>
                      {answer.isCorrect ? (
                        <CheckCircleIcon
                          sx={{ color: "#24A148", fontSize: 24 }}
                        />
                      ) : (
                        <CancelIcon sx={{ color: "#d32f2f", fontSize: 24 }} />
                      )}
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ color: "#1a1b2e" }}
                      >
                        Question {index + 1}
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom
                        sx={{ color: "#666666", mb: 2 }}
                      >
                        {answer.question}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              bgcolor: "rgba(36, 161, 72, 0.1)",
                              p: 2,
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#24A148", mb: 1 }}
                            >
                              Your Answer
                            </Typography>
                            <Typography variant="body1">
                              {answer.userAnswer}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              bgcolor: answer.isCorrect
                                ? "rgba(36, 161, 72, 0.1)"
                                : "rgba(211, 47, 47, 0.1)",
                              p: 2,
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: answer.isCorrect ? "#24A148" : "#d32f2f",
                                mb: 1,
                              }}
                            >
                              Correct Answer
                            </Typography>
                            <Typography variant="body1">
                              {answer.correctAnswer}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {answer.feedback && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "#666666", mb: 1 }}
                          >
                            Feedback
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666666" }}>
                            {answer.feedback}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Overall Feedback */}
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: "#1a1b2e", mb: 3 }}
            >
              Overall Performance Analysis
            </Typography>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                bgcolor: "#fcfcfc",
              }}
            >
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <FeedbackIcon sx={{ color: "#24A148", fontSize: 32 }} />
                  <Typography variant="h6" sx={{ color: "#1a1b2e" }}>
                    Overall Feedback
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: "#666666" }}>
                  {quizResult.feedback}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Navigation Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
            }}
          >
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{
                backgroundColor: "#24A148",
                "&:hover": { backgroundColor: "#1E8E3E" },
                px: 4,
                py: 1.5,
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default QuizResult;
