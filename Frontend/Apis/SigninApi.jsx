import axios from "axios";

// Create an Axios instance with a base URL
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/user", // Replace with your backend's base URL
  timeout: 5000,
});

// Function to handle user sign-in
export const signIn = async (formData) => {
  try {
    const response = await apiClient.post("/signin", formData);
    return response.data; // Return response data to the calling component
  } catch (error) {
    // Throw error to handle it in the component
    throw error.response?.data?.error || "Something went wrong";
  }
};

// Function to redirect to Google OAuth
export const redirectToGoogleLogin = () => {
  window.location.href = "http://localhost:3000/api/user/google";
};

// Other API functions can go here
