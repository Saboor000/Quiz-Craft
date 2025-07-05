import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const GreenSection = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: "#24A148", // Green background
        py: 5, // Vertical padding
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        width: "100%",
        bottom: "0px",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Text Section */}
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#ffffff" }}
          >
            Ready to Create Your Quiz?
          </Typography>
          <Typography variant="body1" sx={{ color: "#ffffff", opacity: 0.9 }}>
            Generate quizzes from text, video, or file in just a few clicks.
          </Typography>
        </Box>

        {/* Button */}
        <Button
          variant="outlined"
          sx={{
            color: "#ffffff",
            borderColor: "#ffffff",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
          }}
          onClick={() => navigate("/signin")}
        >
          GET STARTED
        </Button>
      </Container>
    </Box>
  );
};

export default GreenSection;
