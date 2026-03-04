import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Card,
  CardContent,
  InputAdornment,
  Paper,
  Avatar,
  Badge,
  Drawer,
  useTheme,
  useMediaQuery,
  Tabs,
  Stepper,
  Step,
  StepLabel,
  Tab,
  Chip,
  CircularProgress,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountCircle as AccountCircleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Quiz as QuizIcon,
  Logout as LogoutIcon,
  Timer as TimerIcon,
  TextFields as TextFieldsIcon,
  InsertDriveFile as FileIcon,
  VideoLibrary as VideoLibraryIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Star as StarIcon,
  School as SchoolIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Close as CloseIcon,
  CheckBox as CheckBoxIcon,
  Subject as SubjectIcon,
  BlurOn as BlurOnIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { generateQuiz } from "../../../Apis/QuizApi.jsx";
import {
  fetchQuizResult,
  fetchTodaysActivity,
  fetchMonthlyQuizStats,
  fetchPerformanceAnalytics,
  getOverallPerformance,
  getRecentQuizAttempts,
} from "../../../Apis/QuizResult.jsx";
import { getOverallPerformance as performanceApiGetOverallPerformance } from "../../../Apis/QuizResult.jsx";
import { getAllQuizAttempts } from "../../../Apis/QuizResult.jsx";
import DashboardHeader from "./DashboardHeader";

const hoverableStyle = {
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    bgcolor: "rgba(24, 24, 24, 0.08)",
  },
};

const hoverableCardStyle = {
  cursor: "pointer",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "5px 5px 8px  rgba(0,0,0,0.7)",
  },
};

const categorizeQuizzes = (quizzes) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Sort quizzes by date in descending order
  const sortedQuizzes = [...quizzes].sort((a, b) => {
    const dateA = new Date(a.submittedAt);
    const dateB = new Date(b.submittedAt);
    return dateB - dateA;
  });

  const categorized = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  sortedQuizzes.forEach((quiz) => {
    const quizDate = new Date(quiz.submittedAt);

    if (isSameDay(quizDate, today)) {
      categorized.today.push(quiz);
    } else if (isSameDay(quizDate, yesterday)) {
      categorized.yesterday.push(quiz);
    } else if (quizDate >= lastWeek) {
      categorized.thisWeek.push(quiz);
    } else if (quizDate >= lastMonth) {
      categorized.thisMonth.push(quiz);
    } else {
      categorized.older.push(quiz);
    }
  });

  return categorized;
};

// Change this constant at the top of your component
const MAX_FILE_SIZE_MB = 5; // Changed from 10 to 5

const Dashboard = () => {
  const [quizDuration, setQuizDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [inputSource, setInputSource] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [inputType, setInputType] = useState("");
  const [quizStep, setQuizStep] = useState(0);
  const [showInputFields, setShowInputFields] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    completedToday: 0,
    improvement: 0,
    monthlyImprovement: 0,
  });
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [quizResult, setQuizResult] = useState(null);
  const [todaysActivity, setTodaysActivity] = useState(null);
  const [overallLoading, setOverallLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [performance, setPerformance] = useState({
    completionRate: 0,
    scoreDistribution: {
      excellent: 0,
      good: 0,
      needsImprovement: 0,
    },
  });
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [overallPerformanceData, setOverallPerformanceData] = useState({
    averageScore: 0,
    averagePercentage: 0,
    improvement: 0,
    totalQuizzes: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [recentQuizzesLoading, setRecentQuizzesLoading] = useState(true);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [displayedQuizzes, setDisplayedQuizzes] = useState([]);
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quiz, setQuiz] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [isFileUploading, setIsFileUploading] = useState(false);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    setOpenDialog(true);
  };

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/transcript", {
        video_url: videoUrl,
      });

      if (res.data.quiz) {
        setQuiz(res.data.quiz);
      } else {
        alert("Quiz generation failed.");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        console.log("No userId available");
        return;
      }
      try {
        setHistoryLoading(true);
        const attempts = await getAllQuizAttempts(userId);

        // Format all quiz attempts
        const formatted = attempts.map((item) => ({
          id: item.quiz?._id || "unknown",
          title: item.quiz?.quizTitle || "Untitled Quiz",
          score: item.percentage || 0,
          date: item.timeAgo || "Unknown time",
          submittedAt: item.submittedAt,
        }));

        // Sort quizzes by date in descending order
        const sortedQuizzes = [...formatted].sort((a, b) => {
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        });

        setAllQuizzes(sortedQuizzes);
      } catch (error) {
        console.error("❌ Error fetching all quiz attempts:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Add this useEffect for fetching stats and analytics
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        console.log("No userId available");
        return;
      }

      try {
        // Fetch today's activity
        setActivityLoading(true);
        const activityData = await fetchTodaysActivity(userId);
        setStats((prev) => ({
          ...prev,
          completedToday: activityData.quizzesCompleted || 0,
        }));
        setActivityLoading(false);

        // Fetch monthly stats
        setMonthlyLoading(true);
        const monthlyData = await fetchMonthlyQuizStats(userId);
        setStats((prev) => ({
          ...prev,
          totalQuizzes: monthlyData.totalQuizzes || 0,
          monthlyImprovement: monthlyData.percentageChange || 0,
        }));
        setMonthlyLoading(false);

        // Fetch performance analytics
        setPerformanceLoading(true);
        const performanceData = await fetchPerformanceAnalytics(userId);
        setPerformance(performanceData);
        setPerformanceLoading(false);

        // Fetch overall performance
        setOverallLoading(true);
        const overallData = await getOverallPerformance(userId);
        setOverallPerformanceData(overallData);
        setOverallLoading(false);

        // Fetch recent quizzes
        setRecentQuizzesLoading(true);
        const recentData = await getRecentQuizAttempts(userId);
        const formattedRecentQuizzes = recentData.map((quiz) => ({
          id: quiz.quiz?._id || "unknown",
          title: quiz.quiz?.quizTitle || "Untitled Quiz",
          score: quiz.percentage || 0,
          date: quiz.timeAgo || "Unknown time",
        }));
        setRecentQuizzes(formattedRecentQuizzes);
        setRecentQuizzesLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Reset loading states on error
        setActivityLoading(false);
        setMonthlyLoading(false);
        setPerformanceLoading(false);
        setOverallLoading(false);
        setRecentQuizzesLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // Function to get quizzes for a specific day
  const getQuizzesForDay = (quizzes, targetDate) => {
    return quizzes.filter((quiz) => {
      const quizDate = new Date(quiz.submittedAt);
      return quizDate.toDateString() === targetDate.toDateString();
    });
  };

  // Function to get quizzes within a date range
  const getQuizzesInRange = (quizzes, startDate, endDate) => {
    return quizzes.filter((quiz) => {
      const quizDate = new Date(quiz.submittedAt);
      return quizDate >= startDate && quizDate <= endDate;
    });
  };

  // Function to get older quizzes
  const getOlderQuizzes = (quizzes, cutoffDate) => {
    return quizzes.filter((quiz) => {
      const quizDate = new Date(quiz.submittedAt);
      return quizDate < cutoffDate;
    });
  };

  // Function to get categorized quizzes
  const getCategorizedQuizzes = (quizzes) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const todayQuizzes = getQuizzesForDay(quizzes, today);
    const yesterdayQuizzes = getQuizzesForDay(quizzes, yesterday);
    const thisWeekQuizzes = getQuizzesInRange(quizzes, lastWeek, today);
    const thisMonthQuizzes = getQuizzesInRange(quizzes, lastMonth, today);
    const olderQuizzes = getOlderQuizzes(quizzes, lastMonth);

    return {
      today: todayQuizzes,
      yesterday: yesterdayQuizzes,
      thisWeek: thisWeekQuizzes,
      thisMonth: thisMonthQuizzes,
      older: olderQuizzes,
    };
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setShowInputFields(true);
    if (type === "file") {
      setInputSource("");
    } else {
      setSelectedFile(null);
    }
    setIsFileUploading(false); // Reset file upload state
    setQuizStep((prevStep) => prevStep + 1);
  };

  const handleDifficultySelect = (level) => {
    setDifficultyLevel(level);
    setQuizStep((prevStep) => prevStep + 1);
  };

  const handleQuestionTypeSelect = (type) => {
    setQuestionType(type);
    setQuizStep((prevStep) => prevStep + 1);
  };

  const handleNextStep = () => {
    if (quizStep === 0 && !inputType) {
      setSnackbarMessage("Please select an input type");
      setOpenSnackbar(true);
      return;
    }
    if (quizStep === 1 && !quizDuration) {
      setSnackbarMessage("Please set quiz duration");
      setOpenSnackbar(true);
      return;
    }
    if (quizStep === 2 && !difficultyLevel) {
      setSnackbarMessage("Please select difficulty level");
      setOpenSnackbar(true);
      return;
    }
    if (quizStep === 3 && !questionType) {
      setSnackbarMessage("Please select question type");
      setOpenSnackbar(true);
      return;
    }
    if (
      quizStep === 4 &&
      (!numberOfQuestions || numberOfQuestions < 1 || numberOfQuestions > 50)
    ) {
      setSnackbarMessage("Please enter a valid number of questions (1-50)");
      setOpenSnackbar(true);
      return;
    }
    setQuizStep(quizStep + 1);
  };

  const handleBackStep = () => {
    setQuizStep(quizStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!quizDuration || quizDuration <= 0) {
      setSnackbarMessage("Quiz duration must be a positive number.");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    if (!numberOfQuestions || numberOfQuestions <= 0) {
      setSnackbarMessage("Number of questions must be a positive number.");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    // ✅ Enforce mutual exclusivity
    if (
      (inputType === "text" && selectedFile) ||
      (inputType === "file" && inputSource)
    ) {
      setSnackbarMessage("Please provide only one input: either text OR file.");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    if (inputType === "text" && !inputSource.trim()) {
      setSnackbarMessage("Please enter some input text.");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    if (inputType === "file" && !selectedFile) {
      setSnackbarMessage("Please upload a file.");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    // Ensure questionType is selected
    if (!questionType) {
      setSnackbarMessage("Please select a question type.");
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    if (inputType === "file" && selectedFile) {
      const validation = validateFile(selectedFile);
      if (!validation.isValid) {
        setSnackbarMessage(validation.error);
        setOpenSnackbar(true);
        setIsLoading(false);
        return;
      }

      // Additional check to match generateQuiz function
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setSnackbarMessage(
          `File size should not exceed ${MAX_FILE_SIZE_MB}MB.`,
        );
        setOpenSnackbar(true);
        setIsLoading(false);
        return;
      }
    }

    const quizData = {
      quizDuration,
      difficultyLevel,
      inputType,
      inputSource,
      file: selectedFile,
      questionType,
      numberOfQuestions: parseInt(numberOfQuestions, 10),
    };

    try {
      const response = await generateQuiz(quizData);
      if (response.success && response.quizId) {
        setSnackbarMessage("Quiz generated successfully!");
        setOpenSnackbar(true);

        // Reset form
        setQuizStep(0);
        setInputType("");
        setInputSource("");
        setQuizDuration("");
        setSelectedFile(null);
        setDifficultyLevel("");
        setQuestionType("");
        setNumberOfQuestions("");

        // Navigate to the generated quiz
        navigate(`/take-quiz/${response.quizId}`, {
          state: {
            quizId: response.quizId,
            quizDuration,
            quizTopic: inputSource.slice(0, 30) || "Generated Quiz",
          },
        });
      } else {
        setSnackbarMessage(response.message || "Failed to generate quiz.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      // Backend may return an object like { error: 'msg', stack: '...' }
      const serverMessage =
        (error && (error.error || error.message)) ||
        (error?.response &&
          (error.response.data?.error || error.response.data?.message)) ||
        "An error occurred while generating the quiz.";

      setSnackbarMessage(serverMessage);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = validateFile(file);

      if (!validation.isValid) {
        setSnackbarMessage(validation.error);
        setOpenSnackbar(true);
        event.target.value = "";
        return;
      }

      // Additional check to match generateQuiz function
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setSnackbarMessage(
          `File size should not exceed ${MAX_FILE_SIZE_MB}MB.`,
        );
        setOpenSnackbar(true);
        event.target.value = "";
        return;
      }

      try {
        setIsFileUploading(true);

        // Additional validation for file content (optional)
        if (file.name.endsWith(".txt")) {
          const text = await file.text();
          if (text.length === 0) {
            throw new Error("File is empty");
          }
        }

        // Simulate file upload time (remove this in production)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setSelectedFile(file);
        setSnackbarMessage("File uploaded successfully!");
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error uploading file:", error);
        setSnackbarMessage(
          error.message === "File is empty"
            ? "The file is empty. Please upload a file with content."
            : "Error uploading file. Please try again.",
        );
        setOpenSnackbar(true);
        event.target.value = "";
      } finally {
        setIsFileUploading(false);
      }
    }
  };

  const drawerWidth = 280;

  const handleDrawerToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Render quiz sections
  const renderQuizSections = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const todayQuizzes = getQuizzesForDay(displayedQuizzes, today);
    const yesterdayQuizzes = getQuizzesForDay(displayedQuizzes, yesterday);
    const thisWeekQuizzes = getQuizzesInRange(
      displayedQuizzes,
      lastWeek,
      today,
    );
    const thisMonthQuizzes = getQuizzesInRange(
      displayedQuizzes,
      lastMonth,
      today,
    );
    const olderQuizzes = getOlderQuizzes(displayedQuizzes, lastMonth);

    return (
      <>
        {todayQuizzes.length > 0 && (
          <QuizSection title="Today" quizzes={todayQuizzes} />
        )}
        {yesterdayQuizzes.length > 0 && (
          <QuizSection title="Yesterday" quizzes={yesterdayQuizzes} />
        )}
        {thisWeekQuizzes.length > 0 && (
          <QuizSection title="This Week" quizzes={thisWeekQuizzes} />
        )}
        {thisMonthQuizzes.length > 0 && (
          <QuizSection title="This Month" quizzes={thisMonthQuizzes} />
        )}
        {olderQuizzes.length > 0 && (
          <QuizSection title="Older" quizzes={olderQuizzes} />
        )}
      </>
    );
  };

  const QuizSection = ({ title, quizzes }) => {
    if (!quizzes || quizzes.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#666666",
            fontWeight: 600,
            mb: 1,
            pl: 2,
            borderLeft: "3px solid #24A148",
          }}
        >
          {title}
        </Typography>
        {quizzes.map((quiz) => (
          <ListItem
            key={quiz.id}
            component="button"
            onClick={() => navigate(`/quiz-result/${quiz.id}/${userId}`)}
            sx={{
              ...hoverableStyle,
              mb: 1,
              borderRadius: 1,
              border: "none",
              width: "100%",
              backgroundColor: "transparent",
            }}
          >
            <ListItemIcon>
              <QuizIcon sx={{ color: "#666666" }} />
            </ListItemIcon>
            <ListItemText
              primary={quiz.title}
              secondary={`Score: ${quiz.score}% - ${quiz.date}`}
              sx={{ color: "#666666" }}
            />
          </ListItem>
        ))}
      </Box>
    );
  };

  // Effect to log state changes
  useEffect(() => {
    console.log("Displayed quizzes count:", displayedQuizzes.length);
    console.log("Show all quizzes:", showAllQuizzes);
  }, [displayedQuizzes, showAllQuizzes]);

  // Handler for header History click
  const handleHeaderHistoryClick = () => {
    setIsHistoryExpanded(true);
    setActiveTab(1); // Optionally switch to Recent Quizzes tab if you want
  };

  // Handler for header Analytics click
  const handleHeaderAnalyticsClick = () => {
    setActiveTab(2);
  };

  // Handler for header Dashboard click
  const handleHeaderDashboardClick = () => {
    setActiveTab(0); // Default to Create Quiz tab
    setIsHistoryExpanded(false); // Collapse Quiz History in sidebar
  };

  useEffect(() => {
    // Function to handle browser back/forward navigation
    const handlePopState = (event) => {
      // Prevent the default navigation
      event.preventDefault();

      // Show a confirmation dialog
      const confirmLeave = window.confirm(
        "You must log out before leaving the dashboard. Would you like to log out?",
      );

      if (confirmLeave) {
        // If user confirms, navigate to signin page
        navigate("/signin");
      } else {
        // If user cancels, push the current state back to history
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Add event listener for popstate (back/forward navigation)
    window.addEventListener("popstate", handlePopState);

    // Push initial state to history
    window.history.pushState(null, "", window.location.href);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]); // Add navigate to dependency array

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    const sizeLimits = {
      pdf: MAX_FILE_SIZE_MB * 1024 * 1024, // 10MB
      docx: MAX_FILE_SIZE_MB * 1024 * 1024, // 10MB
      pptx: MAX_FILE_SIZE_MB * 1024 * 1024, // 10MB
      txt: MAX_FILE_SIZE_MB * 1024 * 1024, // 10MB
    };

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    const fileExtension = file.name.split(".").pop().toLowerCase();
    const maxSize = sizeLimits[fileExtension] || MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error:
          "Unsupported file type. Please upload PDF, DOCX, PPTX, or TXT files only.",
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds the limit. Maximum size for all files is ${MAX_FILE_SIZE_MB}MB.`,
      };
    }

    return { isValid: true };
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fdfdfd" }}>
      <DashboardHeader
        onLogout={handleLogout}
        onHistoryClick={handleHeaderHistoryClick}
        onAnalyticsClick={handleHeaderAnalyticsClick}
        onDashboardClick={handleHeaderDashboardClick}
      />

      {/* Sidebar Toggle Button */}
      <IconButton
        onClick={handleDrawerToggle}
        sx={{
          position: "fixed",
          left: isSidebarOpen ? drawerWidth - 12 : 0,
          top: 80,
          zIndex: 1200,
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "0 4px 4px 0",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          transition: theme.transitions.create(["left"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sx={{
          width: isSidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isSidebarOpen ? drawerWidth : 0,
            bgcolor: "#fdfdfd",
            borderRight: "1px solid rgba(0,0,0,0.12)",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 64,
            left: 0,
            height: "calc(100vh - 64px)",
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ overflow: "auto", p: 2, flexGrow: 1 }}>
          <List>
            <ListItem
              component="button"
              onClick={() => navigate("/dashboard")}
              sx={{
                ...hoverableStyle,
                mb: 1,
                borderRadius: "12px",
                border: "none",
                width: "100%",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(36, 161, 72, 0.08)",
                },
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: "#24A148" }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                sx={{
                  color: "#24A148",
                  fontWeight: 600,
                  "& .MuiTypography-root": {
                    fontSize: "0.95rem",
                  },
                }}
              />
            </ListItem>

            <ListItem
              component="button"
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              sx={{
                ...hoverableStyle,
                mb: 1,
                borderRadius: 1,
                border: "none",
                width: "100%",
                backgroundColor: "transparent",
              }}
            >
              <ListItemIcon>
                <HistoryIcon sx={{ color: "#666666" }} />
              </ListItemIcon>
              <ListItemText primary="Quiz History" sx={{ color: "#666666" }} />
              {isHistoryExpanded ? (
                <ExpandLessIcon sx={{ color: "#666666" }} />
              ) : (
                <ExpandMoreIcon sx={{ color: "#666666" }} />
              )}
            </ListItem>

            <Collapse in={isHistoryExpanded} timeout="auto" unmountOnExit>
              <List sx={{ pl: 2 }}>
                {historyLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress sx={{ color: "#24A148" }} />
                  </Box>
                ) : allQuizzes.length > 0 ? (
                  <Box>
                    {(() => {
                      const categorizedQuizzes =
                        getCategorizedQuizzes(allQuizzes);

                      return (
                        <>
                          {categorizedQuizzes.today.length > 0 && (
                            <QuizSection
                              title="Today"
                              quizzes={categorizedQuizzes.today}
                            />
                          )}
                          {categorizedQuizzes.yesterday.length > 0 && (
                            <QuizSection
                              title="Yesterday"
                              quizzes={categorizedQuizzes.yesterday}
                            />
                          )}
                          {categorizedQuizzes.thisWeek.length > 0 && (
                            <QuizSection
                              title="This Week"
                              quizzes={categorizedQuizzes.thisWeek}
                            />
                          )}
                          {categorizedQuizzes.thisMonth.length > 0 && (
                            <QuizSection
                              title="This Month"
                              quizzes={categorizedQuizzes.thisMonth}
                            />
                          )}
                          {categorizedQuizzes.older.length > 0 && (
                            <QuizSection
                              title="Older"
                              quizzes={categorizedQuizzes.older}
                            />
                          )}
                        </>
                      );
                    })()}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", color: "#666666" }}
                  >
                    No quizzes attempted yet
                  </Typography>
                )}
              </List>
            </Collapse>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          mt: 9,
          bgcolor: "#fdfdfd",
          position: "relative",
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Paper
          sx={{
            mb: 4,
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            backgroundColor: "#fdfdfd",
            padding: "10px 22px",
          }}
        >
          {/* Stats Overview */}
          <Grid
            container
            spacing={3}
            sx={{
              mb: 3,
              mt: 3,
              padding: "0px 20px",
            }}
          >
            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  ...hoverableCardStyle,
                  bgcolor: "#fbfbfb",

                  borderRadius: 2,
                  boxShadow: "1 5px 5px rgba(0,0,0,0.5)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <QuizIcon sx={{ color: "#24A148", mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Total Quizzes
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: "#24A148" }}>
                    {monthlyLoading ? (
                      <CircularProgress size={24} sx={{ color: "#24A148" }} />
                    ) : (
                      overallPerformanceData.totalQuizzes
                    )}
                  </Typography>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {monthlyLoading
                        ? "Loading..."
                        : stats.monthlyImprovement >= 0
                          ? `+${stats.monthlyImprovement}% from last month`
                          : `${stats.monthlyImprovement}% from last month`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  ...hoverableCardStyle,
                  bgcolor: "#fbfbfb",
                  borderRadius: 2,
                  boxShadow: "1 5px 5px rgba(0,0,0,0.5)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <TrendingUpIcon sx={{ color: "#24A148", mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Average Score
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: "#24A148" }}>
                    {overallLoading ? (
                      <CircularProgress size={24} sx={{ color: "#24A148" }} />
                    ) : (
                      `${overallPerformanceData.averageScore}%`
                    )}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "text.secondary",
                      fontSize: "0.875rem",
                    }}
                  >
                    {overallLoading ? (
                      "Loading..."
                    ) : (
                      <>
                        <TrendingUpIcon
                          sx={{
                            fontSize: "1rem",
                            color:
                              overallPerformanceData.improvement >= 0
                                ? "#24A148"
                                : "#d32f2f",
                            transform:
                              overallPerformanceData.improvement >= 0
                                ? "none"
                                : "rotate(180deg)",
                          }}
                        />
                        <span>
                          {`${Math.abs(
                            overallPerformanceData.improvement,
                          ).toFixed(2)}% ${
                            overallPerformanceData.improvement >= 0
                              ? "improvement"
                              : "decrease"
                          } from previous average`}
                        </span>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card
                sx={{
                  ...hoverableCardStyle,
                  bgcolor: "#fbfbfb",
                  borderRadius: 2,
                  boxShadow: "1 5px 5px rgba(0,0,0,0.5)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <CheckCircleIcon sx={{ color: "#24A148", mr: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Today's Activity
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: "#24A148" }}>
                    {activityLoading ? (
                      <CircularProgress size={24} sx={{ color: "#24A148" }} />
                    ) : (
                      stats.completedToday
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quizzes completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs for Different Views */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Create Quiz" />
            <Tab label="Recent Quizzes" />
            <Tab label="Analytics" />
          </Tabs>

          {/* Create Quiz Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#212b36", fontWeight: 600 }}
              >
                Create New Quiz
              </Typography>

              <Stepper activeStep={quizStep} sx={{ mb: 3 }}>
                <Step>
                  <StepLabel>Select Input Type</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Configure Quiz</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Select Difficulty</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Question Type</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Number of Questions</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Review & Generate</StepLabel>
                </Step>
              </Stepper>

              {/* Input Type Selection */}
              {quizStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card
                      onClick={() => handleInputTypeChange("text")}
                      sx={{
                        ...hoverableStyle,
                        bgcolor: inputType === "text" ? "#24A148" : "#fbfbfb",
                        borderRadius: 2,
                        boxShadow: "1 5px 5px rgba(0,0,0,0.5)",
                        cursor: "pointer",
                        transition:
                          "all 0.3s ease, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "2px 5px 8px  rgba(0,0,0,0.7)",
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                        <TextFieldsIcon
                          sx={{
                            fontSize: 40,
                            color: inputType === "text" ? "white" : "#24A148",
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: inputType === "text" ? "white" : "#212b36",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          Text Input
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: inputType === "text" ? "white" : "#637381",
                          }}
                        >
                          Enter or paste your text content
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card
                      onClick={() => handleInputTypeChange("video")}
                      sx={{
                        ...hoverableStyle,
                        bgcolor: inputType === "video" ? "#24A148" : "#fbfbfb",
                        borderRadius: 2,
                        boxShadow: "1 5px 5px rgba(0,0,0,0.5)",
                        cursor: "pointer",
                        transition:
                          "all 0.3s ease, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "5px 5px 8px  rgba(0,0,0,0.7)",
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                        <VideoLibraryIcon
                          sx={{
                            fontSize: 40,
                            color: inputType === "video" ? "white" : "#24A148",
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: inputType === "video" ? "white" : "#212b36",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          Video URL
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: inputType === "video" ? "white" : "#637381",
                          }}
                        >
                          Enter a video URL to generate questions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card
                      onClick={() => handleInputTypeChange("file")}
                      sx={{
                        ...hoverableStyle,
                        bgcolor: inputType === "file" ? "#24A148" : "#fbfbfb",
                        borderRadius: 2,
                        boxShadow: "1 5px 5px rgba(0,0,0,0.5)",
                        cursor: "pointer",
                        transition:
                          "all 0.3s ease, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "5px 5px 8px  rgba(0,0,0,0.7)",
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: "center", p: 3 }}>
                        <FileIcon
                          sx={{
                            fontSize: 40,
                            color: inputType === "file" ? "white" : "#24A148",
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: inputType === "file" ? "white" : "#212b36",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          Upload File
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: inputType === "file" ? "white" : "#637381",
                          }}
                        >
                          Upload PDF, DOCX, or TXT files
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Quiz Configuration */}
              {quizStep === 1 && (
                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, color: "#212b36", fontWeight: 600 }}
                  >
                    Quiz Settings
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Quiz Duration (minutes)"
                        type="number"
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TimerIcon sx={{ color: "#24A148" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
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
                      />
                    </Grid>

                    {inputType === "text" && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Input Text"
                          value={inputSource}
                          onChange={(e) => setInputSource(e.target.value)}
                          required
                          multiline
                          rows={1}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TextFieldsIcon sx={{ color: "#24A148" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
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
                        />
                      </Grid>
                    )}

                    {inputType === "video" && (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Video URL"
                          value={inputSource}
                          onChange={(e) => setInputSource(e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VideoLibraryIcon sx={{ color: "#24A148" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
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
                        />
                      </Grid>
                    )}

                    {inputType === "file" && (
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={
                            isFileUploading ? (
                              <CircularProgress size={20} />
                            ) : (
                              <FileIcon />
                            )
                          }
                          disabled={isFileUploading}
                          sx={{
                            borderColor: "#24A148",
                            color: "#24A148",
                            textTransform: "none",
                            py: 1.5,
                            "&:hover": {
                              borderColor: "#1E8E3E",
                              backgroundColor: "rgba(36, 161, 72, 0.08)",
                            },
                            "&.Mui-disabled": {
                              borderColor: "rgba(36, 161, 72, 0.5)",
                              color: "rgba(36, 161, 72, 0.5)",
                            },
                          }}
                        >
                          {isFileUploading ? "Uploading..." : "Upload File"}
                          <input
                            type="file"
                            hidden
                            accept=".txt,.pdf,.docx,.pptx"
                            onChange={handleFileChange}
                            disabled={isFileUploading}
                          />
                        </Button>

                        {/* File size limits information */}
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", fontWeight: 500 }}
                          ></Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            Supported file types:
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            • PDF
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            • DOCX
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            • TXT
                          </Typography>
                        </Box>

                        {selectedFile && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 1.5,
                              mt: 1,
                              bgcolor: "rgba(36, 161, 72, 0.08)",
                              borderRadius: 1,
                            }}
                          >
                            <FileIcon sx={{ color: "#24A148" }} />
                            <Typography variant="body2" color="text.secondary">
                              Selected file: {selectedFile.name} (
                              {formatFileSize(selectedFile.size)})
                            </Typography>
                            {isFileUploading && (
                              <CircularProgress
                                size={16}
                                sx={{ ml: 1, color: "#24A148" }}
                              />
                            )}
                          </Box>
                        )}
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Difficulty Selection */}
              {quizStep === 2 && (
                <Box sx={{ maxWidth: 800, mx: "auto" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, color: "#212b36", fontWeight: 600 }}
                  >
                    Select Quiz Difficulty Level
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4} width={"30%"}>
                      <Card
                        onClick={() => handleDifficultySelect("easy")}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            difficultyLevel === "easy" ? "#24A148" : "#fbfbfb",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: "center", p: 3 }}>
                          <SchoolIcon
                            sx={{
                              fontSize: 40,
                              color:
                                difficultyLevel === "easy"
                                  ? "white"
                                  : "#24A148",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                difficultyLevel === "easy"
                                  ? "white"
                                  : "#212b36",
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            Easy
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                difficultyLevel === "easy"
                                  ? "white"
                                  : "#637381",
                            }}
                          >
                            Basic questions with straightforward answers
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={4} width={"30%"}>
                      <Card
                        onClick={() => handleDifficultySelect("medium")}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            difficultyLevel === "medium"
                              ? "#24A148"
                              : "#fbfbfb",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: "center", p: 3 }}>
                          <PsychologyIcon
                            sx={{
                              fontSize: 40,
                              color:
                                difficultyLevel === "medium"
                                  ? "white"
                                  : "#24A148",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                difficultyLevel === "medium"
                                  ? "white"
                                  : "#212b36",
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            Medium
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                difficultyLevel === "medium"
                                  ? "white"
                                  : "#637381",
                            }}
                          >
                            Moderate difficulty with some challenging questions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={4} width={"31%"}>
                      <Card
                        onClick={() => handleDifficultySelect("hard")}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            difficultyLevel === "hard" ? "#24A148" : "#fbfbfb",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: "center", p: 3 }}>
                          <SpeedIcon
                            sx={{
                              fontSize: 40,
                              color:
                                difficultyLevel === "hard"
                                  ? "white"
                                  : "#24A148",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                difficultyLevel === "hard"
                                  ? "white"
                                  : "#212b36",
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            Hard
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                difficultyLevel === "hard"
                                  ? "white"
                                  : "#637381",
                            }}
                          >
                            Challenging questions requiring deep understanding
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Question Type Selection */}
              {quizStep === 3 && (
                <Box sx={{ maxWidth: 800, mx: "auto" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, color: "#212b36", fontWeight: 600 }}
                  >
                    Select Question Type
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4} width={"30%"}>
                      <Card
                        onClick={() => handleQuestionTypeSelect("mcq")}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            questionType === "mcq" ? "#24A148" : "#fbfbfb",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: "center", p: 3 }}>
                          <CheckBoxIcon
                            sx={{
                              fontSize: 40,
                              color:
                                questionType === "mcq" ? "white" : "#24A148",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                questionType === "mcq" ? "white" : "#212b36",
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            Multiple Choice
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                questionType === "mcq" ? "white" : "#637381",
                            }}
                          >
                            Questions with multiple answer options
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={4} width={"30%"}>
                      <Card
                        onClick={() => handleQuestionTypeSelect("open ended")}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            questionType === "open ended"
                              ? "#24A148"
                              : "#fbfbfb",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: "center", p: 3 }}>
                          <SubjectIcon
                            sx={{
                              fontSize: 40,
                              color:
                                questionType === "open ended"
                                  ? "white"
                                  : "#24A148",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                questionType === "open ended"
                                  ? "white"
                                  : "#212b36",
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            Open Ended
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                questionType === "open ended"
                                  ? "white"
                                  : "#637381",
                            }}
                          >
                            Questions requiring written responses
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={4} width={"32%"}>
                      <Card
                        onClick={() => handleQuestionTypeSelect("mixed")}
                        sx={{
                          cursor: "pointer",
                          bgcolor:
                            questionType === "mixed" ? "#24A148" : "#fbfbfb",
                          borderRadius: 2,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <CardContent sx={{ textAlign: "center", p: 3 }}>
                          <BlurOnIcon
                            sx={{
                              fontSize: 40,
                              color:
                                questionType === "mixed" ? "white" : "#24A148",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                questionType === "mixed" ? "white" : "#212b36",
                              fontWeight: 600,
                              mb: 1,
                            }}
                          >
                            Mixed
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                questionType === "mixed" ? "white" : "#637381",
                            }}
                          >
                            Combination of multiple choice and open-ended
                            questions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Number of Questions Selection */}
              {quizStep === 4 && (
                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, color: "#212b36", fontWeight: 600 }}
                  >
                    Enter Number of Questions
                  </Typography>

                  <Card
                    sx={{
                      bgcolor: "#fbfbfb",
                      borderRadius: 2,
                      p: 4,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Stack spacing={3}>
                      <TextField
                        label="Number of Questions"
                        type="number"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <QuizIcon sx={{ color: "#24A148" }} />
                            </InputAdornment>
                          ),
                          inputProps: {
                            min: 1,
                            max: 50,
                          },
                        }}
                        helperText="Enter a number between 1 and 50"
                        sx={{
                          "& .MuiOutlinedInput-root": {
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
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Please enter the number of questions you want in your
                        quiz. We recommend between 5-15 questions for optimal
                        assessment.
                      </Typography>
                    </Stack>
                  </Card>
                </Box>
              )}

              {/* Review & Generate */}
              {quizStep === 5 && (
                <Box sx={{ maxWidth: 600, mx: "auto" }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 2,
                      color: "#212b36",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    Review & Adjust Quiz Settings
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      color: "#637381",
                      textAlign: "center",
                    }}
                  >
                    Review and modify your quiz settings before generation
                  </Typography>

                  <Card
                    sx={{
                      bgcolor: "#fbfbfb",
                      borderRadius: 2,
                      p: 4,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Stack spacing={3}>
                      {/* Input Type */}
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: "#666666" }}>
                          Input Type
                        </InputLabel>
                        <Select
                          value={inputType}
                          label="Input Type"
                          onChange={(e) => {
                            setInputType(e.target.value);
                            setInputSource("");
                            setSelectedFile(null);
                            setVideoUrl("");
                            setNumberOfQuestions("");
                          }}
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(0, 0, 0, 0.1)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#24A148",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#24A148",
                            },
                          }}
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="file">File</MenuItem>
                          <MenuItem value="video">Video</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Dynamic Input Field */}
                      {inputType === "text" && (
                        <TextField
                          label="Enter Text"
                          multiline
                          rows={1}
                          value={inputSource}
                          onChange={(e) => setInputSource(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TextFieldsIcon sx={{ color: "#24A148" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
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
                        />
                      )}
                      {inputType === "file" && (
                        <Box>
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={
                              isFileUploading ? (
                                <CircularProgress size={20} />
                              ) : (
                                <FileIcon />
                              )
                            }
                            disabled={isFileUploading}
                            sx={{
                              borderColor: "#24A148",
                              color: "#24A148",
                              textTransform: "none",
                              py: 1.5,
                              "&:hover": {
                                borderColor: "#1E8E3E",
                                backgroundColor: "rgba(36, 161, 72, 0.08)",
                              },
                              "&.Mui-disabled": {
                                borderColor: "rgba(36, 161, 72, 0.5)",
                                color: "rgba(36, 161, 72, 0.5)",
                              },
                            }}
                          >
                            {isFileUploading ? "Uploading..." : "Upload File"}
                            <input
                              type="file"
                              hidden
                              accept=".txt,.pdf,.docx,.pptx"
                              onChange={handleFileChange}
                              disabled={isFileUploading}
                            />
                          </Button>

                          {/* File size limits information */}
                          <Box sx={{ mt: 1, mb: 2 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", fontWeight: 500 }}
                            ></Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              Supported file types:
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              • PDF
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              • DOCX
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              • TXT
                            </Typography>
                          </Box>

                          {selectedFile && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1.5,
                                mt: 1,
                                bgcolor: "rgba(36, 161, 72, 0.08)",
                                borderRadius: 1,
                              }}
                            >
                              <FileIcon sx={{ color: "#24A148" }} />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Selected file: {selectedFile.name} (
                                {formatFileSize(selectedFile.size)})
                              </Typography>
                              {isFileUploading && (
                                <CircularProgress
                                  size={16}
                                  sx={{ ml: 1, color: "#24A148" }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                      {inputType === "video" && (
                        <TextField
                          label="Enter Video URL"
                          value={inputSource}
                          onChange={(e) => setInputSource(e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VideoLibraryIcon sx={{ color: "#24A148" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
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
                        />
                      )}

                      {/* Duration */}
                      <TextField
                        label="Duration (minutes)"
                        type="number"
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TimerIcon sx={{ color: "#24A148" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
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
                      />

                      {/* Number of Questions */}
                      <TextField
                        label="Number of Questions"
                        type="number"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <QuizIcon sx={{ color: "#24A148" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
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
                      />

                      {/* Difficulty */}
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: "#666666" }}>
                          Difficulty Level
                        </InputLabel>
                        <Select
                          value={difficultyLevel}
                          label="Difficulty Level"
                          onChange={(e) => setDifficultyLevel(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(0, 0, 0, 0.1)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#24A148",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#24A148",
                            },
                          }}
                        >
                          <MenuItem value="easy">Easy</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="hard">Hard</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Question Type */}
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: "#666666" }}>
                          Question Type
                        </InputLabel>
                        <Select
                          value={questionType}
                          label="Question Type"
                          onChange={(e) => setQuestionType(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(0, 0, 0, 0.1)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#24A148",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#24A148",
                            },
                          }}
                        >
                          <MenuItem value="mcq">Multiple Choice</MenuItem>
                          <MenuItem value="open ended">Open Ended</MenuItem>
                          <MenuItem value="mixed">Mixed</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Card>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 3,
                  mb: 0,
                }}
              >
                <Button
                  onClick={handleBackStep}
                  disabled={quizStep === 0}
                  sx={{
                    color: "#24A148",
                    "&:hover": {
                      backgroundColor: "rgba(36, 161, 72, 0.08)",
                    },
                  }}
                >
                  Back
                </Button>
                {quizStep < 5 ? (
                  <Button
                    onClick={handleNextStep}
                    variant="contained"
                    sx={{
                      backgroundColor: "#24A148",
                      "&:hover": {
                        backgroundColor: "#1E8E3E",
                      },
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      backgroundColor: "#24A148",
                      "&:hover": {
                        backgroundColor: "#1E8E3E",
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Generate Quiz"
                    )}
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Recent Quizzes Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recent Quizzes
              </Typography>
              {recentQuizzesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress sx={{ color: "#24A148" }} />
                </Box>
              ) : recentQuizzes.length > 0 ? (
                <Grid container spacing={3}>
                  {recentQuizzes.map((quiz) => (
                    <Grid item xs={12} md={6} key={quiz.id}>
                      <Card
                        sx={{
                          ...hoverableCardStyle,
                          bgcolor: "#fbfbfb",
                          borderRadius: 2,
                          boxShadow: "1 5px 5px rgba(0,0,0,0.1)",
                        }}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography variant="h6">{quiz.title}</Typography>
                            <Chip
                              label={`${quiz.score}%`}
                              color={
                                quiz.score >= 80
                                  ? "success"
                                  : quiz.score >= 60
                                    ? "warning"
                                    : "error"
                              }
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            Completed {quiz.date}
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<QuizIcon />}
                            onClick={() =>
                              navigate(`/quiz-result/${quiz.id}/${userId}`)
                            }
                            sx={{
                              borderColor: "#24A148",
                              color: "#24A148",
                              ...hoverableStyle,
                            }}
                          >
                            View Results
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", p: 3 }}>
                  <Typography color="text.secondary">
                    No recent quizzes found
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Performance Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      ...hoverableCardStyle,
                      bgcolor: "#fbfbfb",
                      borderRadius: 2,
                      boxShadow: "1 5px 5px rgba(0,0,0,0.3)",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Quiz Completion Rate
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        {performanceLoading ? (
                          <CircularProgress
                            size={60}
                            thickness={4}
                            sx={{ color: "#24A148", mr: 2 }}
                          />
                        ) : (
                          <>
                            <CircularProgress
                              variant="determinate"
                              value={performance.completionRate}
                              size={60}
                              thickness={4}
                              sx={{ color: "#24A148", mr: 2 }}
                            />
                            <Box>
                              <Typography variant="h4">
                                {performance.completionRate}%
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Average completion rate
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      ...hoverableCardStyle,
                      bgcolor: "#fbfbfb",
                      borderRadius: 2,
                      boxShadow: "1 5px 5px rgba(0,0,0,0.5)",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Score Distribution
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {performanceLoading ? (
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              p: 2,
                            }}
                          >
                            <CircularProgress
                              size={24}
                              sx={{ color: "#24A148" }}
                            />
                          </Box>
                        ) : (
                          <>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ width: 100 }}>
                                Excellent (80-100%)
                              </Typography>
                              <Box sx={{ flexGrow: 1, ml: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    performance.scoreDistribution.excellent
                                  }
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "rgba(36, 161, 72, 0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: "#24A148",
                                    },
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {performance.scoreDistribution.excellent}%
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ width: 100 }}>
                                Good (60-79%)
                              </Typography>
                              <Box sx={{ flexGrow: 1, ml: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={performance.scoreDistribution.good}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "rgba(36, 161, 72, 0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: "#24A148",
                                    },
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {performance.scoreDistribution.good}%
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="body2" sx={{ width: 100 }}>
                                Needs Improvement
                              </Typography>
                              <Box sx={{ flexGrow: 1, ml: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    performance.scoreDistribution
                                      .needsImprovement
                                  }
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "rgba(36, 161, 72, 0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: "#24A148",
                                    },
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {performance.scoreDistribution.needsImprovement}
                                %
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Logout Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: "#666666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpenDialog(false);
              navigate("/signin");
            }}
            sx={{ color: "#24A148", "&:hover": { color: "#1E8E3E" } }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Dashboard;
