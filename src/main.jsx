import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "@/App.jsx";
import "@/index.css";

// Google Client ID - try env variable, fallback to hardcoded
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1093346328647-s5o92uj0q77dsn61e3g9ooe1fjdlpqdj7.apps.googleusercontent.com";

console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID);
console.log("Vite env:", import.meta.env);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() => console.error("שגיאה בטעינת Google OAuth")}
    >
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
