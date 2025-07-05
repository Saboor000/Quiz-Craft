import { scrollToSection } from "../../src/utils/scrollUtils";

const Navbar = () => {
  return (
    <nav>
      {/* ... other navbar content ... */}
      <button onClick={() => scrollToSection("features")}>Features</button>
      <button onClick={() => scrollToSection("about")}>About</button>
      {/* ... other navigation items ... */}
    </nav>
  );
};
