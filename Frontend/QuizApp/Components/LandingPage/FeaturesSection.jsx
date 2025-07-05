import { Container, Grid, Typography, Paper, Box } from "@mui/material";

function FeaturesSection() {
  const features = [
    {
      title: "Input Content",
      desc: "Upload text, file, or video for quiz generation.",
    },
    { title: "AI-Powered", desc: "Get AI-generated quiz questions instantly." },
    {
      title: "Interactive",
      desc: "Take quizzes, get instant results, and track progress.",
    },
  ];

  return (
    <Box sx={{ py: 10, backgroundColor: "#F9FAFB" }}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: "center",
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">{feature.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default FeaturesSection;
