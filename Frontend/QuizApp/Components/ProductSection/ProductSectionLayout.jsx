import { Box } from "@mui/material";
import GreenSection from "../GreenSection";

const ProductSectionLayout = ({ children }) => {
  return (
    <Box
      sx={{
        userSelect: "none",
      }}
    >
      {children}
      <GreenSection />
    </Box>
  );
};

export default ProductSectionLayout;
