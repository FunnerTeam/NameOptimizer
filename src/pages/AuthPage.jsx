import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  AlertCircle,
  Sparkles,
  Shield,
  CheckCircle,
} from "lucide-react";

import { loginWithGoogle } from "../services/userService";

export default function AuthPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // אם כבר מחובר, הפנה לדף הרצוי
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/upload");
    }
  }, [navigate]);

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    console.log("tokenResponse_handleGoogleLoginSuccess", tokenResponse);
    try {
      setIsLoading(true);
      setError(null);

      const response = await loginWithGoogle(tokenResponse.access_token);
      console.log("result_handleGoogleLoginSuccess", response);

      if (response.token) {
        console.log("response.token", response.token);
        localStorage.setItem("access_token", response.token);
        // הפנה ישירות לדף העלאה
        window.location.href = "/upload";
      } else {
        setError("שגיאה בהתחברות");
      }
    } catch (err) {
      console.error("שגיאה בהתחברות:", err);
      setError("שגיאה בהתחברות עם Google");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: (error) => {
      console.error("Google Login Error:", error);
      setError("שגיאה בהתחברות עם Google");
      setIsLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              ברוכים הבאים
            </h1>
            <p className="text-lg text-slate-600">
              התחברו למערכת לטיוב והעשרת אנשי קשר
            </p>
          </div>

          {/* Auth Card */}
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <Alert
                      variant="destructive"
                      className="border-red-200 bg-red-50"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                {/* Google Login Button */}
                <Button
                  onClick={() => {
                    setIsLoading(true);
                    googleLogin();
                  }}
                  disabled={isLoading}
                  className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
                  variant="outline"
                >
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>מתחבר...</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="w-5 h-5"
                      />
                      <span className="font-medium">התחבר עם Google</span>
                    </div>
                  )}
                </Button>

                {/* Features */}
                <div className="pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-600 mb-4 text-center">
                    מה תקבלו לאחר ההתחברות:
                  </h3>

                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>שמירת תוצאות עיבוד למשך 24 שעות</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>גישה להיסטוריית עיבודים קודמים</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <Shield className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span>אבטחה מלאה ופרטיות מוגנת</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-slate-500">
              בלחיצה על &quot;התחבר עם Google&quot; אתם מסכימים{" "}
              <a href="#" className="text-teal-600 hover:underline">
                לתנאי השימוש
              </a>{" "}
              ו
              <a href="#" className="text-teal-600 hover:underline">
                למדיניות הפרטיות
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
