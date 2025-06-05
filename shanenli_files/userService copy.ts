import axiosInstance from "../utils/axiosInstance";

export const loginWithGoogle = async (
  googleAccessToken: string
): Promise<{ token: string }> => {
  try {
    console.log("googleAccessToken", googleAccessToken);
    const response = await axiosInstance.post("/api/auth/login", {
      googleAccessToken,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error logging in:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const validateToken = async () => {
  try {
    const response = await axiosInstance.get("/auth/validate-token");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error validating token:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const response = await axiosInstance.get("/auth/user");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching user data:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
