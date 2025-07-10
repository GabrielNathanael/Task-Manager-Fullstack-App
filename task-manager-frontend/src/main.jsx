import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext"; // ✅ Tambahkan ini

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SearchProvider>
        {" "}
        <App />
      </SearchProvider>
    </AuthProvider>
  </StrictMode>
);
