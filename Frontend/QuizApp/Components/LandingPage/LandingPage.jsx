import React, { useEffect } from "react";

function LandingPage() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all sections
    document.querySelectorAll(".scroll-container").forEach((section) => {
      section.style.opacity = "0";
      section.style.transform = "translateY(20px)";
      section.style.transition =
        "opacity 0.6s ease-out, transform 0.6s ease-out";
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <HeroSection />
      <ProductsSection />
      <AboutSection />
      <FeaturesSection />
      <ContactForm />
    </div>
  );
}

export default LandingPage;
