// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import Dashboard from "./Components/UserDashboard/Dashboard";
// import Signin from "./Components/Homepage/Signin";
// import Signup from "./Components/Homepage/Signup";
// import ProtectedRoute from "./Components/ProtectedRoute";
// import Achievements from "./Components/UserDashboard/Achievements";
import Profile from "./Components/UserDashboard/Profile";
import Settings from "./Components/UserDashboard/Settings";

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: "#24A148",
//     },
//     background: {
//       default: "#f8f9fa",
//     },
//   },
// });

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router>
//         <Routes>
//           <Route path="/signin" element={<Signin />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/achievements"
//             element={
//               <ProtectedRoute>
//                 <Achievements />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/" element={<Signin />} />
//         </Routes>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;
