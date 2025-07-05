import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Email,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
} from "@mui/icons-material";

// Add the consistent textfield styles
const textFieldStyles = {
  backgroundColor: "#ffffff",
  borderRadius: 1,
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(0, 0, 0, 0.1)",
    },
    "&:hover fieldset": {
      borderColor: "#24A148",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#24A148",
      borderWidth: "2px",
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "'Poppins', sans-serif",
    color: "#666666",
    fontSize: "0.95rem",
    "&.Mui-focused": {
      color: "#24A148",
      fontWeight: 500,
    },
  },
  "& .MuiOutlinedInput-input": {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "1rem",
    color: "#333333",
  },
};

function ContactForm() {
  return (
    <Box
      sx={{
        width: "100%",
        py: 10,
        backgroundColor: "#ffffff",
        userSelect: "none",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left Side - Contact Form */}
          <Box sx={{ flex: 1, minWidth: "320px", maxWidth: "48%" }}>
            <Typography
              variant="h6"
              sx={{
                color: "#24A148",
                textTransform: "uppercase",
                fontWeight: 700,
                letterSpacing: 1,
                mb: 1,
              }}
            >
              Get in touch
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "2.5rem" },
                color: "#000000",
                fontFamily: "'Poppins', sans-serif",
                mb: 4,
              }}
            >
              We're here to assist you!
            </Typography>

            <Paper elevation={0} sx={{ backgroundColor: "#ffffff" }}>
              <Box component="form">
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  margin="normal"
                  required
                  sx={{ ...textFieldStyles, mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email address"
                  variant="outlined"
                  margin="normal"
                  required
                  sx={{ ...textFieldStyles, mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Phone number"
                  variant="outlined"
                  margin="normal"
                  required
                  sx={{ ...textFieldStyles, mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Message"
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  required
                  sx={{ ...textFieldStyles, mb: 2 }}
                />

                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label={
                    <Typography variant="body2" sx={{ color: "#333" }}>
                      I allow this website to store my submission so they can
                      respond to my inquiry.
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#24A148",
                    color: "#ffffff",
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    px: 5,
                    py: 1.5,
                    "&:hover": { backgroundColor: "#1E873A" },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Right Side - Contact Information */}
          <Box sx={{ flex: 1, minWidth: "320px", maxWidth: "40%" }}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "#F4F4F4",
                p: 4,
                borderRadius: "10px",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: "#000000" }}
              >
                Get in touch
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  color: "#333",
                }}
              >
                <Email sx={{ mr: 1 }} /> saboorsamad010@gmail.com
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, color: "#000000" }}
              >
                Location
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  color: "#333",
                }}
              >
                <LocationOn sx={{ mr: 1 }} /> Islamabad, IS PK
              </Typography>

              {/* Follow Us Section */}
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1, color: "#000000" }}
              >
                Follow Us
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Facebook
                  sx={{ fontSize: 30, color: "#1877F2", cursor: "pointer" }}
                />
                <Twitter
                  sx={{ fontSize: 30, color: "#1DA1F2", cursor: "pointer" }}
                />
                <LinkedIn
                  sx={{ fontSize: 30, color: "#0077B5", cursor: "pointer" }}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default ContactForm;
