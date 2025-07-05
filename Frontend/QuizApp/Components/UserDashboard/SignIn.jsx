import { useEffect } from "react";

const SignIn = () => {
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      const confirmLeave = window.confirm(
        "You must sign in first to access the dashboard."
      );
      if (confirmLeave) {
        window.history.pushState(null, "", window.location.href);
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
};
 