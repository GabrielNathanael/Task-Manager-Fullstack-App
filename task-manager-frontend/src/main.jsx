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
        {/* ✅ Pindahkan ke sini, agar global */}
        <App />
      </SearchProvider>
    </AuthProvider>
  </StrictMode>
);
