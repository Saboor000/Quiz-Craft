import axios from "axios";

// Function to fetch user details
export const getUserDetails = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:3000/api/user/details", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // Return user details
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error; // Propagate the error to be handled in the component
  }
};
