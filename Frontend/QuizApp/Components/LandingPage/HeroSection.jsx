import { Container, Typography, Button, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";

function HeroSection() {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 500); // Delay animation for smoother effect
  }, []);

  const handleNavigation = () => {
    navigate("/signin");
  };
  return (
    <Box
      className="scroll-container"
      sx={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: 'url("/images/hs3.jpg")', // Ensure correct path
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // Keeps background image fixed
        color: "white",
        animation: "bgZoom 10s infinite alternate ease-in-out", // Subtle zoom effect
        transition: "transform 0.3s ease-out",
        willChange: "transform",
      }}
    >
      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5))", // Gradient dark overlay
        }}
      />

      {/* Content */}
      <Container
        sx={{
          position: "relative", // Keeps text separate from the fixed background
          zIndex: 1,
          maxWidth: "800px",
          textAlign: "left",
          opacity: animate ? 1 : 0, // Fade-in effect
          transform: animate ? "translateY(0px)" : "translateY(30px)", // Floating effect
          transition: "all 1.5s ease-in-out",
          userSelect: "none",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "2.5rem", md: "4rem" },
            textShadow: "3px 3px 10px rgba(0, 0, 0, 0.5)",
            animation: "floatText 3s infinite alternate ease-in-out",
          }}
        >
          QGC
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: "1.2rem", md: "1.5rem" },
            fontWeight: "400",
            mb: 3,
            textShadow: "3px 3px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          Create quizzes with ease
        </Typography>
        <Button
          onClick={handleNavigation}
          variant="contained"
          sx={{
            backgroundColor: "#24A148",
            color: "#ffffff",
            fontSize: "1rem",
            px: 4,
            py: 1.5,
            fontWeight: "600",
            textTransform: "uppercase",
            borderRadius: "5px",
            animation: "pulseButton 2s infinite",
            "&:hover": { backgroundColor: "#1E8B3F" },
          }}
        >
          Start Creating Quiz
        </Button>
      </Container>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes floatText {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-15px); }
          }

          @keyframes pulseButton {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }

          @keyframes bgZoom {
            0% { background-size: 100%; }
            100% { background-size: 105%; }
          }
        `}
      </style>
    </Box>
  );
}

export default HeroSection;
