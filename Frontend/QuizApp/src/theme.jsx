import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#004AAD", // Adjust to match the original site's primary color
    },
    secondary: {
      main: "#F59E0B", // Adjust to match the original site's secondary color
    },
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#333333",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif", // Ensure this matches the original site's font
    h1: {
      fontSize: "3rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1.1rem",
      lineHeight: 1.6,
    },
  },
});

export default theme;
