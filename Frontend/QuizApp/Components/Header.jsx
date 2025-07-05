import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { scroller } from "react-scroll";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHome, setIsHome] = useState(location.pathname === "/");

  useEffect(() => {
    setIsHome(location.pathname === "/");
  }, [location]);

  const handleNavigation = (section) => {
    if (isHome) {
      scroller.scrollTo(section, {
        duration: 500,
        smooth: true,
        offset: -80,
      });
    } else {
      navigate("/");
      setTimeout(() => {
        scroller.scrollTo(section, {
          duration: 500,
          smooth: true,
          offset: -80,
        });
      }, 500);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      <Container>
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <RouterLink
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                fontSize: "1.8rem",
                color: "black",
                fontFamily: "'Poppins', sans-serif",
                animation: "slideInLeft 1s ease-out",
                cursor: "pointer",
              }}
            >
              QGC
            </Typography>
          </RouterLink>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              onClick={() => handleNavigation("home-section")}
              sx={navButtonStyles}
            >
              Home
            </Button>
            <Button
              onClick={() => handleNavigation("about-section")}
              sx={navButtonStyles}
            >
              About
            </Button>
            <Button
              onClick={() => handleNavigation("products-section")}
              sx={navButtonStyles}
            >
              Products
            </Button>
            <Button
              onClick={() => handleNavigation("how-it-works-section")}
              sx={navButtonStyles}
            >
              How It Works
            </Button>
            <Button
              onClick={() => handleNavigation("contact-section")}
              sx={contactButtonStyles}
            >
              Contact
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

const navButtonStyles = {
  mx: 1.5,
  fontSize: "1rem",
  fontWeight: "500",
  textTransform: "none",
  color: "#333333",
  fontFamily: "'Poppins', sans-serif",
  opacity: 0,
  animation: "fadeInNav 1s ease-in-out forwards",
  "&:hover": { color: "#24A148" },
};

const contactButtonStyles = {
  mx: 1.5,
  fontSize: "1rem",
  fontWeight: "700",
  textTransform: "none",
  color: "#333333",
  padding: "5px 30px",
  fontFamily: "'Poppins', sans-serif",
  border: "1px solid black",
  borderRadius: "4px",
  transition: "all 0.3s ease",
  "&:hover": {
    color: "#24A148",
    borderColor: "#24A148",
    transform: "scale(1.1)",
  },
  opacity: 0,
  animation: "fadeInUp 1.5s ease-in-out forwards",
};

export default Header;
