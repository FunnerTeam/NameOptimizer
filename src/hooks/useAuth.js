import { useState, useEffect, useCallback } from "react";
import {
  loginWithGoogle,
  validateToken,
  getUserData,
  logoutUser,
} from "../services/userService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // בדיקת אימות בטעינת הדף
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await validateToken();
      if (response.success) {
        setUser(response.user);
      } else {
        localStorage.removeItem("access_token");
      }
    } catch (error) {
      console.error("שגיאה בבדיקת אימות:", error);
      localStorage.removeItem("access_token");
      setError("שגיאה בבדיקת אימות");
    } finally {
      setLoading(false);
    }
  }, []);

  // התחברות עם Google
  const loginWithGoogleToken = useCallback(async (googleAccessToken) => {
    try {
      setLoading(true);
      setError(null);

      const response = await loginWithGoogle(googleAccessToken);

      if (response.token) {
        localStorage.setItem("access_token", response.token);
        // Get user data after login
        const userData = await getUserData();
        if (userData.success) {
          setUser(userData.user);
          return { success: true, user: userData.user };
        }
      }

      throw new Error("שגיאה בהתחברות");
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "שגיאה בהתחברות";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // התנתקות
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("שגיאה בהתנתקות:", error);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  // בדיקה אם המשתמש מחובר
  const isAuthenticated = useCallback(() => {
    return !!user && !!localStorage.getItem("access_token");
  }, [user]);

  // קבלת פרטי משתמש מעודכנים
  const refreshUser = useCallback(async () => {
    try {
      const response = await getUserData();
      if (response.success) {
        setUser(response.user);
        return response.user;
      }
    } catch (error) {
      console.error("שגיאה בעדכון פרטי משתמש:", error);
    }
    return null;
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    loginWithGoogle: loginWithGoogleToken,
    logout,
    checkAuthentication,
    refreshUser,
  };
}

export default useAuth;
