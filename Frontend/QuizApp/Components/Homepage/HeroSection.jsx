import OptimizedImage from "../../src/components/common/OptimizedImage";

const HeroSection = () => {
  return (
    <section className="scroll-container">
      <OptimizedImage
        src="/path/to/your/image.jpg"
        alt="Hero image"
        className="hero-image"
        style={{
          width: "100%",
          height: "auto",
          maxHeight: "600px",
          objectFit: "cover",
        }}
      />
      {/* Rest of your hero section content */}
    </section>
  );
};
