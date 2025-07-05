import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Signin from "../Components/Homepage/Signin.jsx";
import Signup from "../Components/Homepage/Signup.jsx";
import Dashboard from "../Components/UserDashboard/Dashboard.jsx"; // Import the Dashboard component
import MyQuiz from "../Components/UserDashboard/MyQuiz.jsx";
import TakeQuiz from "../Components/UserDashboard/TakeQuiz.jsx";
import QuizResult from "../Components/UserDashboard/QuizResult.jsx";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import Header from "../Components/Header.jsx";
import GreenSection from "../Components/GreenSection.jsx";
import HeroSection from "../Components/LandingPage/HeroSection.jsx";
import AboutSection from "../Components/LandingPage/AboutSection.jsx";
import ProductsSection from "../Components/LandingPage/ProductSection.jsx";
import HowItWorksSection from "../Components/LandingPage/HowItWorksSection.jsx";
import ContactSection from "../Components/LandingPage/ContactForm.jsx";
import Footer from "../Components/FooterSection.jsx";
import QuizGenApp from "../Components/ProductSection/QuizGenApp.jsx";
import Feedback from "../Components/ProductSection/Feedback.jsx";
import QuizExperience from "../Components/ProductSection/QuizExperience.jsx";
import ForgotPassword from "../Components/Homepage/ForgotPassword.jsx";
import Profile from "../Components/UserDashboard/Profile.jsx";
import { Element } from "react-scroll";

function AppContent() {
  const location = useLocation();

  // Define routes where Header should be hidden
  const hideHeaderRoutes = ["/my-quizzes", "/take-quiz", "/quiz-result"];

  // Check if current path matches any hideHeaderRoutes
  const shouldHideHeader = hideHeaderRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      document.body.classList.add("is-scrolling");

      scrollTimeout = setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  return (
    <>
      {!shouldHideHeader && <Header />}
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <>
              <Element name="home-section">
                <HeroSection />
              </Element>
              <Element name="about-section">
                <AboutSection />
              </Element>
              <Element name="products-section">
                <ProductsSection />
              </Element>
              <Element name="how-it-works-section">
                <HowItWorksSection />
              </Element>
              <Element name="contact-section">
                <ContactSection />
              </Element>
              <Footer />
            </>
          }
        />

        {/* Other Routes */}
        <Route path="/quizgenapp" element={<QuizGenApp />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/quiz-experience" element={<QuizExperience />} />
        <Route path="/green-section" element={<GreenSection />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-quizzes" element={<MyQuiz />} />
        <Route path="/take-quiz" element={<TakeQuiz />} />
        <Route path="/take-quiz/:quizId" element={<TakeQuiz />} />
        <Route path="/quiz-result/:quizId/:userId" element={<QuizResult />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

function App() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      document.body.classList.add("is-scrolling");

      scrollTimeout = setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
export default App;
