import React, { memo } from "react";

const Section = memo(({ children, id, className = "" }) => (
  <section
    id={id}
    className={`scroll-container ${className}`}
    style={{
      transform: "translate3d(0,0,0)",
      willChange: "transform",
      position: "relative",
      zIndex: 1,
    }}
  >
    {children}
  </section>
));

export default Section;
