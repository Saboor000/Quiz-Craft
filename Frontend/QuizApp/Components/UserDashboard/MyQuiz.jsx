import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Collapse,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const QuizResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openHistory, setOpenHistory] = useState(false); // State to control expansion of quiz history
  const [quizzesHistory, setQuizzesHistory] = useState([]); // Store past quizzes

  // Fallbacks in case location.state is null
  const quizId = location.state?.quizId;
  const questions = location.state?.questions || [];
  const userAnswers = location.state?.userAnswers || {};
  const correctAnswers = location.state?.correctAnswers || {};

  // If quizId or questions are missing, navigate back to dashboard
  useEffect(() => {
    if (!quizId || !questions.length) {
      navigate("/dashboard");
    }

    // Mock past quizzes history (this could be fetched from an API or local storage)
    const pastQuizzes = [
      { id: "quiz1", title: "Math Quiz", score: 8, totalQuestions: 10 },
      { id: "quiz2", title: "Science Quiz", score: 6, totalQuestions: 10 },
    ];
    setQuizzesHistory(pastQuizzes);
  }, [quizId, questions, navigate]);

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === correctAnswers[index]) {
        score += 1;
      }
    });
    return score;
  };

  const totalQuestions = questions.length;
  const score = calculateScore();
  const attemptedQuestions = Object.keys(userAnswers).length;

  // Provide feedback based on performance
  const getFeedback = () => {
    if (score / totalQuestions >= 0.8) {
      return "Excellent job! Keep it up!";
    } else if (score / totalQuestions >= 0.5) {
      return "Good effort! But there’s room for improvement.";
    } else {
      return "Don’t worry, keep practicing, and you’ll improve!";
    }
  };

  const handleRetakeQuiz = () => {
    navigate("/create-quiz");
  };

  const handleBackToHistory = () => {
    navigate("/my-quizzes");
  };

  const handleQuizSelect = (quizId) => {
    // Fetch the selected quiz's details and navigate to QuizResult
    const selectedQuiz = quizzesHistory.find((quiz) => quiz.id === quizId);
    navigate(`/quiz-result/${quizId}`, { state: selectedQuiz });
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "flex-start",
        marginTop: "64px", // Adjust this based on your navbar height
      }}
    >
      <CssBaseline />

      <Box
        sx={{
          width: "80%",
          padding: 4,
          borderRadius: "8px",
          boxShadow: 3,
          margin: "25px",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>

        {/* Score Summary */}
        <Typography variant="h6" gutterBottom>
          Your Score: {score} / {totalQuestions} (
          {((score / totalQuestions) * 100).toFixed(2)}%)
        </Typography>
        <Typography variant="body1" gutterBottom>
          Attempted Questions: {attemptedQuestions} / {totalQuestions}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Feedback: {getFeedback()}
        </Typography>

        {/* Displaying each question and its results */}
        <List>
          {questions.map((question, index) => (
            <ListItem key={index} sx={{ marginBottom: 2 }}>
              <ListItemText
                primary={`Q${index + 1}: ${question.questionText}`}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      Your Answer: {userAnswers[index] || "No Answer"}
                    </Typography>
                    <br />
                    <Typography
                      component="span"
                      variant="body2"
                      color={
                        userAnswers[index] === correctAnswers[index]
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      Correct Answer: {correctAnswers[index]}
                    </Typography>
                    <br />
                    {/* Feedback for each question */}
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                    >
                      {userAnswers[index] === correctAnswers[index]
                        ? "Great job!"
                        : "Try again next time!"}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Retake Quiz and Back to History Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleRetakeQuiz}
          >
            Retake Quiz
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleBackToHistory}
          >
            Back to My Quizzes
          </Button>
        </Box>

        {/* Expandable Quiz History */}
        <Box sx={{ marginTop: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOpenHistory(!openHistory)}
          >
            {openHistory ? "Hide Quiz History" : "Show Quiz History"}
          </Button>

          <Collapse in={openHistory} sx={{ marginTop: 2 }}>
            <List>
              {quizzesHistory.map((quiz) => (
                <ListItem
                  key={quiz.id}
                  button
                  onClick={() => handleQuizSelect(quiz.id)}
                >
                  <ListItemText
                    primary={`${quiz.title} - Score: ${quiz.score} / ${quiz.totalQuestions}`}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

export default QuizResult;
