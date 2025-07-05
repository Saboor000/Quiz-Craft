import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/user/logout", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent
      });

      if (response.ok) {
        // Clear token from localStorage or other storage
        localStorage.removeItem("token");

        // Redirect to the login page
        navigate("/signin");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (err) {
      console.error("Logout failed:", err);
      alert("An error occurred while logging out");
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{ padding: "10px 20px", cursor: "pointer" }}
    >
      Logout
    </button>
  );
};

export default Logout;
