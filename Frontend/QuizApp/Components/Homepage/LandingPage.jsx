import React from "react";
import Section from "../../src/components/common/Section";
import { scrollToSection } from "../../src/utils/scrollUtils";

const LandingPage = () => {
  return (
    <div className="scroll-container">
      <Section id="hero">{/* Your hero section content */}</Section>

      <Section id="features">{/* Your features section content */}</Section>

      <Section id="about">{/* Your about section content */}</Section>

      {/* Add more sections as needed */}
    </div>
  );
};

export default LandingPage;
