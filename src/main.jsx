import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "@/App.jsx";
import "@/index.css";

// Google Client ID מקובץ הסביבה
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.warn("VITE_GOOGLE_CLIENT_ID לא מוגדר בקובץ .env");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID || ""}
      onScriptLoadError={() => console.error("שגיאה בטעינת Google OAuth")}
    >
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
