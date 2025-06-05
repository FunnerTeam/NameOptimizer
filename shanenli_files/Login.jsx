import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "../services/userService";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    console.log("tokenResponse_handleGoogleLoginSuccess", tokenResponse);
    try {
      setIsLoading(true);
      setError(null);
      const response = await loginWithGoogle(tokenResponse.access_token);
      const token = response.token;
      localStorage.setItem("access_token", token);
      navigate("/dashboard");
      // localStorage.setItem("access_token", tokenResponse.access_token);
      // navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("התרחשה שגיאה בהתחברות. אנא נסו שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: () => {
      setError("התחברות נכשלה. אנא נסו שוב.");
      setIsLoading(false);
    },
    flow: "implicit",
    scope: "email profile",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 p-3 flex justify-between items-center shadow-md">
        <div className="w-11 h-11"></div>
        <div className="flex flex-col items-center">
          <span className="font-extrabold text-xl text-blue-600 flex items-center">
            Family
            <span
              style={{
                display: "inline-flex",
                verticalAlign: "super",
                position: "relative",
                top: "-0.5em",
                marginRight: "0.2em",
              }}
            >
              <span
                className="inline-flex w-[18px] h-[18px] rounded-full items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #4f8cff 0%, #a259ff 100%)",
                  fontSize: "0.7rem",
                  boxShadow: "0 2px 4px rgba(79, 140, 255, 0.2)",
                }}
              >
                <span
                  className="text-white font-extrabold"
                  style={{ lineHeight: 1, marginTop: "-0.05em" }}
                >
                  +
                </span>
              </span>
            </span>
          </span>
          <span
            className="font-light text-[10px]"
            style={{
              background: "linear-gradient(90deg, #4f8cff 0%, #a259ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.03em",
              marginTop: "-0.2em",
            }}
          >
            ניהול משפחתי חכם
          </span>
        </div>
        <div className="w-11 h-11"></div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              ברוכים הבאים
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              התחברו כדי להתחיל להשתמש באפליקציה
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-center text-sm">
              {error}
            </div>
          )}

          <div className="mt-8">
            <Button
              onClick={() => {
                setIsLoading(true);
                login();
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {isLoading ? "מתחבר..." : "התחברות עם Google"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
