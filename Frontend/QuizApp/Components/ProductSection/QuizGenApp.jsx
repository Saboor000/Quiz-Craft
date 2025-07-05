import { Container, Grid, Typography, Box } from "@mui/material";
import ProductSectionLayout from "./ProductSectionLayout";

const QuizGenApp = () => {
  return (
    <ProductSectionLayout>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fdfdfd",
          py: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center", // Centers content vertically
          minHeight: "100vh", // Ensures full height centering
          paddingTop: "0px",
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
            alignItems="center" // Aligns items from the same start point
            justifyContent="center" // Centers content horizontally
            sx={{ textAlign: "left" }} // Ensures text alignment
          >
            {/* Text Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: "500px", mx: "auto" }}>
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
                  Quiz Generator App
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: "#333", lineHeight: 1.6 }}
                >
                  Transform your learning experience with our innovative quiz
                  generator app. Utilizing the advanced LLM model, this app
                  allows you to create quizzes from various input types,
                  including text, files, and videos. Simply upload your content
                  and watch as the app generates engaging quizzes tailored to
                  your material. Once you've completed a quiz, you can submit
                  your answers to receive immediate feedback, including scores
                  and correct answers. This tool not only enhances learning but
                  also encourages retention and understanding of complex
                  subjects. Get ready to challenge yourself and elevate your
                  knowledge!
                </Typography>
              </Box>
            </Grid>

            {/* Image Section */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "35px",
              }}
            >
              <Box
                component="img"
                src="/images/p4.jpg"
                alt="Quiz Generator App"
                sx={{
                  width: "100%",
                  maxWidth: "400px",
                  borderRadius: "10px",
                  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ProductSectionLayout>
  );
};

export default QuizGenApp; // Ensure this line is present
