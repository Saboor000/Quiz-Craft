import { useEffect } from "react";

export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Optimize scroll performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Your scroll-based updates here
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Optimize image loading
    const images = document.querySelectorAll("img[data-src]");
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.1,
      }
    );

    images.forEach((img) => imageObserver.observe(img));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      images.forEach((img) => imageObserver.unobserve(img));
    };
  }, []);
};
