import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook

const products = [
  {
    title: "Quiz generator app",
    desc: "Create engaging quizzes effortlessly with our app.",
    img: "/images/p4.jpg",
    route: "/quizgenapp", // Add route path
  },
  {
    title: "Feedback system",
    desc: "Receive instant feedback on your quiz performance.",
    img: "/images/p5.jpg",
    route: "/feedback", // Add route path
  },
  {
    title: "Interactive quiz experience",
    desc: "Experience learning through interactive quizzes.",
    img: "/images/p6.jpg",
    route: "/quiz-experience", // Add route path
  },
];

function ProductsSection() {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 500);
  }, []);

  return (
    <Box
      id="products-section"
      className="scroll-container"
      sx={{
        width: "100%",
        backgroundColor: "#F5F7F8",
        py: 10,
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6, userSelect: "none" }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#24A148",
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: 1,
              opacity: animate ? 1 : 0,
              transform: animate ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s ease-in-out",
            }}
          >
            Interactive Quiz Builder
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "2rem", md: "2.8rem" },
              color: "#000000",
              mt: 1,
              opacity: animate ? 1 : 0,
              transform: animate ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s ease-in-out",
            }}
          >
            Create quizzes from text, files, or videos.
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {products.map((product, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{ cursor: "pointer" }}
            >
              <Card
                onClick={() => navigate(product.route)} // Navigate on click
                sx={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                  transition:
                    "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.2)",
                  },
                  opacity: animate ? 1 : 0,
                  transform: animate ? "translateY(0)" : "translateY(30px)",
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.img}
                  alt={product.title}
                  loading="lazy"
                />
                <CardContent sx={{ padding: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: "#000",
                      letterSpacing: "1px",
                    }}
                  >
                    {product.title} &rsaquo;
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
                    {product.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default ProductsSection;
