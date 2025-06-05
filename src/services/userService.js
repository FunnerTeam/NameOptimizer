// זהו service זמני לניהול משתמשים עד שיומש מערכת login מלאה

import axiosInstance from "../utils/axiosInstance";

export const loginWithGoogle = async (googleAccessToken) => {
  try {
    console.log("googleAccessToken", googleAccessToken);
    const response = await axiosInstance.post("/api/auth/login", {
      googleAccessToken,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error logging in:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const validateToken = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/validate-token");
    return response.data;
  } catch (error) {
    console.error(
      "Error validating token:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const response = await axiosInstance.get("/api/auth/user");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching user data:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await axiosInstance.post("/api/auth/logout");
    localStorage.removeItem("access_token");
  } catch (error) {
    console.error("Error logging out:", error);
    // Remove token anyway
    localStorage.removeItem("access_token");
  }
};
