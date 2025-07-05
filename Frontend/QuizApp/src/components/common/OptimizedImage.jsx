import React, { useState, useEffect, useRef } from "react";

const OptimizedImage = ({ src, alt, className, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <img
      ref={imgRef}
      data-src={src}
      alt={alt}
      className={`${className} ${isLoaded ? "loaded" : ""}`}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
        transform: "translateZ(0)",
        willChange: "transform",
        loading: "lazy",
      }}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

export default OptimizedImage;
