import { Container, Typography, Box, Grid, Link } from "@mui/material";

function AboutSection() {
  return (
    <Box sx={{ py: 12, backgroundColor: "#ffffff" }}>
      <Container>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Text */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              userSelect: "none",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "#24A148",
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: 1,
                mb: 1,
              }}
            >
              Quiz Your Knowledge
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "2rem", md: "2.5rem" },
                color: "#000000",
                mb: 2,
              }}
            >
              Innovative quiz creation made easy
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: "1.1rem",
                fontWeight: 400,
                color: "#333",
                lineHeight: "1.7",
                maxWidth: "600px",
              }}
            >
              Unlock your learning potential with <b>QGC</b>, the ultimate quiz
              app designed to make learning interactive and fun! Powered by
              advanced AI, including LLM models like ChatGPT, QGC generates
              personalized quizzes from text, files, and videos. Challenge
              yourself with engaging quizzes, track your progress in real-time,
              and receive instant feedback on your performance. Whether you're a
              student, professional, or just love testing your knowledge, QGC
              transforms the way you learn—anytime, anywhere!
            </Typography>

            {/* Get in touch Link */}
            <Link
              href="#"
              sx={{
                display: "inline-block",
                mt: 2,
                color: "#000",
                fontSize: "1rem",
                fontWeight: 500,
                textDecoration: "underline",
                "&:hover": { color: "#24A148" },
              }}
            >
              Get in touch
            </Link>
          </Grid>

          {/* Right Side - Image */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="/images/about1.jpg" // Ensure correct image path
              alt="About Us"
              sx={{
                width: "60%",
                maxWidth: "400px",
                height: "auto",
                display: "block",
                borderRadius: "16px",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default AboutSection;
