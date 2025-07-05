import { Container, Grid, Typography, Box } from "@mui/material";
import ProductSectionLayout from "./ProductSectionLayout";

const Feedback = () => {
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
                  Feedback System
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: "#333", lineHeight: 1.6 }}
                >
                  Maximize your learning potential with our intuitive feedback
                  system integrated within the quiz app. After completing each
                  quiz, users can submit their answers and receive comprehensive
                  feedback. This feature allows you to review your performance,
                  understand mistakes, and learn from them. The app provides
                  detailed insights into your answers, helping you identify
                  areas for improvement. Whether you're studying for an exam or
                  simply seeking to expand your knowledge, this feedback
                  mechanism empowers you to refine your skills and boosts your
                  confidence. Take charge of your learning journey today!
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
                src="/images/p5.jpg"
                alt="Feedback System"
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

export default Feedback;
