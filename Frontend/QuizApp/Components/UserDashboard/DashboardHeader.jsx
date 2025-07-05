import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Dashboard as DashboardIcon,
  Quiz as QuizIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ArrowBack,
  Timer,
} from "@mui/icons-material";

function DashboardHeader({
  onLogout,
  onHistoryClick,
  onAnalyticsClick,
  onDashboardClick,
  title,
  timer,
  showNavButtons = true,
  onBack,
  showProfile = true,
}) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    onLogout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        animation: "fadeIn 1s ease-in-out",
        zIndex: 1200,
      }}
    >
      <Container>
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Left side: logo, nav, back */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {onBack && (
              <IconButton
                onClick={onBack}
                sx={{
                  mr: 1,
                  color: "#24A148",
                  background: "rgba(36,161,72,0.08)",
                  borderRadius: 2,
                }}
              >
                <ArrowBack />
              </IconButton>
            )}
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                fontSize: "1.8rem",
                color: "black",
                fontFamily: "'Poppins', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 1,
                animation: "slideInLeft 1s ease-out",
                cursor: "pointer",
              }}
              onClick={onDashboardClick || (() => navigate("/dashboard"))}
            >
              QGC
            </Typography>
            {showNavButtons && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  onClick={onDashboardClick}
                  sx={navButtonStyles}
                  startIcon={<DashboardIcon />}
                >
                  Dashboard
                </Button>
                <Button
                  onClick={onHistoryClick}
                  sx={navButtonStyles}
                  startIcon={<HistoryIcon />}
                >
                  History
                </Button>
                <Button
                  onClick={onAnalyticsClick}
                  sx={navButtonStyles}
                  startIcon={<AnalyticsIcon />}
                >
                  Analytics
                </Button>
              </Box>
            )}
          </Box>

          {/* Right side: title, timer, profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
            {title && (
              <Typography
                variant="h6"
                sx={{ color: "#212b36", fontWeight: 600 }}
              >
                {title}
              </Typography>
            )}
            {typeof timer === "number" && (
              <Card
                sx={{
                  backgroundColor: "#24A148",
                  color: "white",
                  padding: "4px 14px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <Timer sx={{ fontSize: 20 }} />
                <Typography variant="subtitle1">
                  {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </Typography>
              </Card>
            )}
            {showProfile !== false && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    flexDirection: "column",
                    alignItems: "flex-end",
                    "& .MuiTypography-root": {
                      lineHeight: 1.2,
                    },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: "#212b36" }}
                  >
                    Welcome back
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#637381" }}>
                    {localStorage.getItem("username") || ""}
                  </Typography>
                </Box>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                  color="success"
                >
                  <Avatar
                    onClick={handleProfileClick}
                    sx={{
                      bgcolor: "#24A148",
                      cursor: "pointer",
                      width: 45,
                      height: 45,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 4px 12px rgba(36, 161, 72, 0.2)",
                      },
                    }}
                  >
                    <AccountCircleIcon />
                  </Avatar>
                </Badge>
              </Box>
            )}
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleProfileClose}
            onClick={handleProfileClose}
            PaperProps={{
              elevation: 0,
              sx: {
                backgroundColor: "#fdfdfd",
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={() => navigate("/profile")}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" sx={{ color: "#24A148" }} />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: "#24A148" }} />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

const navButtonStyles = {
  mx: 1,
  fontSize: "1rem",
  fontWeight: "500",
  textTransform: "none",
  color: "#333333",
  fontFamily: "'Poppins', sans-serif",
  opacity: 0,
  animation: "fadeInNav 1s ease-in-out forwards",
  "&:hover": {
    color: "#24A148",
    backgroundColor: "rgba(36, 161, 72, 0.08)",
  },
  "& .MuiSvgIcon-root": {
    color: "#24A148",
  },
};

export default DashboardHeader;
