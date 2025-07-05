import { Container, Typography, Box, Grid, Link } from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 4, md: 5 }, // Reduced height
        backgroundColor: "#0F1A12", // Updated exact color match
        color: "white",
        userSelect: "none",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="center">
          {/* Column 1 - About */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: "1.3rem", // Slightly smaller for compact layout
                mb: 1.5,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              About Us
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, color: "rgba(255,255,255,0.8)" }}
            >
              We create AI-powered quizzes that enhance learning. Upload
              content, generate quizzes, and track progress effortlessly.
            </Typography>
          </Grid>

          {/* Column 2 - Quick Links */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: "1.3rem",
                mb: 1.5,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Quick Links
            </Typography>
            <Box>
              {["Home", "About", "Products", "Contact"].map((text, index) => (
                <Link
                  key={index}
                  href="#"
                  color="inherit"
                  underline="none"
                  display="block"
                  sx={{
                    fontSize: "0.95rem",
                    mb: 1,
                    transition: "color 0.3s ease-in-out",
                    "&:hover": { color: "#FDC830" },
                  }}
                >
                  {text}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Column 3 - Contact Info */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: "1.3rem",
                mb: 1.5,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
            >
              📧 Email: QGC@ssaz.com
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "rgba(255,255,255,0.8)" }}
            >
              📞 Phone: +92 3330443578
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
              📍 Location: Islamabad, Pakistan
            </Typography>
          </Grid>
        </Grid>

        {/* Bottom Copyright Bar */}
        <Box
          sx={{
            mt: 4,
            textAlign: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            pt: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            © 2025 QGC. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
