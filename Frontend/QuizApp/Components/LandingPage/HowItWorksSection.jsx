import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Button,
  Modal,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";

const contentData = [
  {
    title: "Input your content",
    description: "Easily upload your content in text, file, or video format.",
    modalDescription:
      "Get started by inputting your content in three different formats: text, file, or video. Simply choose the format that best suits your needs and upload it into our intuitive platform...",
    image: "/images/hw1.jpg",
  },
  {
    title: "Quiz generation",
    description: "Receive a unique quiz tailored to your content input.",
    modalDescription:
      "Our AI-powered engine analyzes your input and creates thought-provoking questions...",
    image: "/images/hw3.jpg",
  },
];

function HowItWorksSection() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpen = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = () => {
    if (currentIndex < contentData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Box sx={{ textAlign: "center", py: 12 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h6"
          sx={{ color: "#24A148", textTransform: "uppercase", fontWeight: 700 }}
        >
          Quiz Creation Made Easy
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "2rem", md: "2.8rem" },
            mb: 6,
          }}
        >
          Generate quizzes from text, files, and videos
        </Typography>

        {/* Grid Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
          }}
        >
          {contentData.map((item, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                borderRadius: "10px",
                overflow: "hidden",
                textAlign: "left",
                transition: "0.3s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Box
                component="img"
                src={item.image}
                alt={item.title}
                sx={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "#666", mt: 1 }}>
                  {item.description}
                </Typography>
                <Button
                  onClick={() => handleOpen(index)}
                  sx={{
                    mt: 1,
                    color: "#24A148",
                    fontWeight: "600",
                    textDecoration: "underline",
                    "&:hover": { color: "#24A148" },
                  }}
                >
                  Learn more
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Modal with Blur Background */}
        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <Paper
              elevation={4}
              sx={{
                width: { xs: "90%", md: "50%" },
                maxWidth: "700px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                p: 3,
                position: "relative",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                textAlign: "left",
              }}
            >
              {/* Close Button */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "#666",
                }}
                onClick={handleClose}
              >
                <Close />
              </IconButton>

              {/* Image Section */}
              <Box
                component="img"
                src={contentData[currentIndex].image}
                alt={contentData[currentIndex].title}
                sx={{
                  width: { xs: "100%", md: "50%" },
                  height: "auto",
                  objectFit: "cover",
                  borderRadius: "10px",
                  mr: { md: 3 },
                }}
              />

              {/* Text Section */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {contentData[currentIndex].title}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: "#666" }}>
                  {contentData[currentIndex].modalDescription}
                </Typography>

                {/* Pagination Controls */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 3,
                    gap: 2,
                    color: "#666",
                  }}
                >
                  <IconButton
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <Typography variant="body2">
                    {currentIndex + 1} / {contentData.length}
                  </Typography>
                  <IconButton
                    disabled={currentIndex === contentData.length - 1}
                    onClick={handleNext}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
}

export default HowItWorksSection; // Ensure this line is present
