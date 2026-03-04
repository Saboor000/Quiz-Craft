import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import {
  getUserDetails,
  updatePassword,
  sendOtpToCurrentEmail,
  verifyCurrentEmailOtp,
  updateUserEmail,
} from "../../../Apis/Details";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import LogoutIcon from "@mui/icons-material/Logout";
import MuiAlert from "@mui/material/Alert";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    isEmailVerified: false,
    dob: "",
    country: "",
    createdAt: "",
  });
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    dob: "",
    country: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailUpdateDialog, setEmailUpdateDialog] = useState(false);
  const [otpDialog, setOtpDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailUpdateError, setEmailUpdateError] = useState("");
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  const [currentEmailOtp, setCurrentEmailOtp] = useState("");
  const [currentEmailVerified, setCurrentEmailVerified] = useState(false);
  const [currentEmailDialog, setCurrentEmailDialog] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [showNewEmailModal, setShowNewEmailModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [showLogoutSnackbar, setShowLogoutSnackbar] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      navigate("/signin");
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError("");
        const userDetails = await getUserDetails();
        if (!userDetails) {
          throw new Error("No user details received");
        }
        setUserData(userDetails);
        setProfileForm({
          firstname: userDetails.firstname,
          lastname: userDetails.lastname,
          email: userDetails.email,
          dob: userDetails.dob ? userDetails.dob.split("T")[0] : "",
          country: userDetails.country,
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
        if (err.response?.status === 401) {
          console.error("Token is invalid or expired");
          localStorage.removeItem("token");
          navigate("/signin");
        } else {
          setError("Failed to load profile data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      // Add your API call here to update profile
      // await updateProfile(profileForm);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setError(null);

      const token = localStorage.getItem("token"); // ✅ Get token from storage
      if (!token) throw new Error("User not authenticated");

      await sendOtpToCurrentEmail(token); // ✅ Pass token here

      toast.success("OTP sent to your current email");
      setShowEmailVerificationModal(true);
      setShowEmailModal(false);
    } catch (error) {
      setError(error.message || "Failed to send OTP");
      toast.error(error.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      setError(null);

      const token = localStorage.getItem("token"); // ✅ Get JWT token
      if (!token) throw new Error("User not authenticated");

      const response = await verifyCurrentEmailOtp(otp); // ✅ Don't pass token, API handles it

      if (response && response.success) {
        toast.success("Email verified successfully");
        setShowEmailVerificationModal(false);
        setShowNewEmailModal(true);
      } else {
        throw new Error(response?.error || "Failed to verify OTP");
      }
    } catch (error) {
      setError(error.message || "Failed to verify OTP");
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      const response = await updateUserEmail(newEmail); // Only pass newEmail
      if (response && response.success) {
        toast.success(response.message || "Email updated successfully");
        setEmailUpdateSuccess(true);
        fetchUserData();
      } else {
        throw new Error(response?.error || "Failed to update email");
      }
    } catch (error) {
      setError(error.message || "Failed to update email");
      toast.error(error.message || "Failed to update email");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("New passwords do not match");
        return;
      }
      await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setErrorDialogMessage(err.error || "Failed to update password");
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      const userDetails = await getUserDetails();
      if (!userDetails) {
        throw new Error("No user details received");
      }
      setUserData(userDetails);
      setProfileForm({
        firstname: userDetails.firstname,
        lastname: userDetails.lastname,
        email: userDetails.email,
        dob: userDetails.dob ? userDetails.dob.split("T")[0] : "",
        country: userDetails.country,
      });
    } catch (err) {
      console.error("Error fetching user details:", err);
      if (err.response?.status === 401) {
        console.error("Token is invalid or expired");
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        setError("Failed to load profile data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutDialog(false);
    setShowLogoutSnackbar(true);
    setTimeout(() => {
      navigate("/signin");
    }, 1500);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#24A148" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fdfdfd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <DashboardHeader onLogout={handleLogoutClick} />
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowLogoutDialog(false)}
            sx={{ color: "#666666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            sx={{ color: "#24A148", "&:hover": { color: "#1E8E3E" } }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showLogoutSnackbar}
        autoHideDuration={1500}
        onClose={() => setShowLogoutSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          sx={{ width: "100%" }}
        >
          You have been logged out.
        </MuiAlert>
      </Snackbar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "#fcfcfc",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mr: 3,
                bgcolor: "#24A148",
                fontSize: "2.5rem",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              {userData.firstname.charAt(0)}
              {userData.lastname.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{ color: "#1a1b2e", mb: 1, fontWeight: 600 }}
              >
                {userData.firstname} {userData.lastname}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  {userData.email}
                </Typography>
                {userData.isEmailVerified ? (
                  <Tooltip title="Email Verified">
                    <span>
                      <FaCheck color="#24A148" />
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Email Not Verified">
                    <span>
                      <FaTimes color="#dc3545" />
                    </span>
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: 1,
                background: "#fff0f0",
                color: "#b71c1c",
                fontWeight: 500,
                fontSize: "1rem",
                alignItems: "center",
              }}
              icon={false}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ErrorOutlineIcon sx={{ mr: 1, color: "#b71c1c" }} />
                {error}
              </Box>
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>
              {success}
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
              },
            }}
          >
            <Tab label="Edit Profile" />
            <Tab label="Change Password" />
          </Tabs>

          {activeTab === 0 && (
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstname"
                    value={profileForm.firstname}
                    onChange={handleChange}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#24A148",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#24A148",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastname"
                    value={profileForm.lastname}
                    onChange={handleChange}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#24A148",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#24A148",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      disabled
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "rgba(0, 0, 0, 0.1)",
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => setShowEmailModal(true)}
                      sx={{
                        backgroundColor: "#24A148",
                        "&:hover": { backgroundColor: "#1E8E3E" },
                        textTransform: "none",
                        px: 3,
                      }}
                    >
                      Change Email
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={profileForm.dob}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#24A148",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#24A148",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={profileForm.country}
                    onChange={handleChange}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(0, 0, 0, 0.1)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#24A148",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#24A148",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      backgroundColor: "#24A148",
                      "&:hover": {
                        backgroundColor: "#1E8E3E",
                      },
                      height: "48px",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <Box component="form" onSubmit={handlePasswordUpdate}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showPassword.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                current: !showPassword.current,
                              })
                            }
                            edge="end"
                          >
                            {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                new: !showPassword.new,
                              })
                            }
                            edge="end"
                          >
                            {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!error}
                    helperText={error}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword({
                                ...showPassword,
                                confirm: !showPassword.confirm,
                              })
                            }
                            edge="end"
                          >
                            {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!error}
                    helperText={error}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      backgroundColor: "#24A148",
                      "&:hover": { backgroundColor: "#1E8E3E" },
                      height: "48px",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: "#1976d2",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() =>
                      navigate("/forgot-password?redirect=profile")
                    }
                  >
                    Forgot Password?
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>

      <Dialog
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Change Email</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            To change your email, we need to verify your current email first.
          </Typography>
          {emailUpdateError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: 1,
                background: "#fff0f0",
                color: "#b71c1c",
                fontWeight: 500,
                fontSize: "1rem",
                alignItems: "center",
              }}
              icon={false}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ErrorOutlineIcon sx={{ mr: 1, color: "#b71c1c" }} />
                {emailUpdateError}
              </Box>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setShowEmailModal(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendOtp}
            variant="contained"
            sx={{
              backgroundColor: "#24A148",
              "&:hover": { backgroundColor: "#1E8E3E" },
              textTransform: "none",
            }}
          >
            Send Verification OTP
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showEmailVerificationModal}
        onClose={() => {
          setShowEmailVerificationModal(false);
          setOtp("");
          setError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Verify Current Email</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Please enter the OTP sent to your current email address.
          </Typography>
          <TextField
            fullWidth
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setShowEmailVerificationModal(false);
              setOtp("");
              setError(null);
            }}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerifyOtp}
            disabled={isVerifying}
            variant="contained"
            sx={{
              backgroundColor: "#24A148",
              "&:hover": { backgroundColor: "#1E8E3E" },
              textTransform: "none",
            }}
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showNewEmailModal}
        onClose={() => {
          setShowNewEmailModal(false);
          setNewEmail("");
          setError(null);
          setEmailUpdateSuccess(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          {emailUpdateSuccess ? "Updated Email" : "Enter New Email"}
        </DialogTitle>
        <DialogContent>
          {emailUpdateSuccess ? (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Your email has been updated to <b>{newEmail}</b>.
            </Typography>
          ) : (
            <TextField
              fullWidth
              label="New Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setShowNewEmailModal(false);
              setNewEmail("");
              setError(null);
              setEmailUpdateSuccess(false);
            }}
            sx={{ color: "text.secondary" }}
          >
            {emailUpdateSuccess ? "OK" : "Cancel"}
          </Button>
          {!emailUpdateSuccess && (
            <Button
              onClick={handleUpdateEmail}
              disabled={isUpdating}
              variant="contained"
              sx={{
                backgroundColor: "#24A148",
                "&:hover": { backgroundColor: "#1E8E3E" },
                textTransform: "none",
              }}
            >
              {isUpdating ? "Updating..." : "Update Email"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: "#b71c1c", fontWeight: 700 }}>
          Error
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#b71c1c", fontWeight: 500 }}>
            {errorDialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowErrorDialog(false)}
            sx={{
              color: "#fff",
              backgroundColor: "#24A148",
              "&:hover": { backgroundColor: "#1E8E3E" },
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
            variant="contained"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
