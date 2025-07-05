import { Container, Grid, Typography, Box } from "@mui/material";
import ProductSectionLayout from "./ProductSectionLayout";

const QuizExperience = () => {
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
          margin: "",
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
                  Interactive Quiz Experience
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: "#333", lineHeight: 1.6 }}
                >
                  Engage with your learning material like never before with our
                  interactive quiz experience. This app incorporates dynamic
                  quizzes based on various media inputs—text, files, and
                  videos—making it a versatile tool for learners of all types.
                  The interactive nature of the quizzes keeps users motivated
                  and invested in their learning process. After completing a
                  quiz, participants can easily check their scores and analyze
                  their answers for better comprehension. Ideal for individual
                  study or group activities, this app transforms traditional
                  learning into an enjoyable and effective experience. Unleash
                  your curiosity and dive into learning!
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
              }}
            >
              <Box
                component="img"
                src="/images/p6.jpg"
                alt="Interactive Quiz Experience"
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

export default QuizExperience; // Ensure this line is present
