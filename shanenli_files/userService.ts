import { IScoreRequest } from "@web/types/request.types";
import axiosInstance from "./axiosInstance";

export const loginWithGoogle = async (
  googleAccessToken: string
): Promise<{ token: string }> => {
  try {
    const response = await axiosInstance.post("/login", {
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
    const response = await axiosInstance.get("/validate-token");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error validate token in:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getUserData = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/get-user-data");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching user data:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const getTeacherData = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get("/get-teacher-data");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching teacher data:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const saveUserScore = async (requestBody: IScoreRequest): Promise<any> => {
  try {
    const response = await axiosInstance.post("/save-score", requestBody);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error saving user score:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const updateUserRank = async (userRank: number): Promise<any> => {
  try {
    const response = await axiosInstance.put("/update-rank", { userRank });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating user rank:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
