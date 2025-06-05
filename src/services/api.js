import axios from "axios";

// הגדרת URL בסיס לAPI
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// יצירת instance של axios עם הגדרות בסיס
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 שניות timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - להוסיף headers נוספים או authentication
api.interceptors.request.use(
  (config) => {
    // כאן ניתן להוסיף authentication headers בעתיד
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - לטיפול בשגיאות גלובליות
api.interceptors.response.use(
  (response) => {
    // כל תגובה מוצלחת
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error);

    // טיפול בשגיאות נפוצות
    if (error.response) {
      // השרת החזיר תגובה עם status code של שגיאה
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error("בקשה לא תקינה:", data.error);
          break;
        case 401:
          console.error("לא מורשה - נדרש login");
          // כאן ניתן להפנות לדף login
          break;
        case 403:
          console.error("אין הרשאה לפעולה זו");
          break;
        case 404:
          console.error("המשאב לא נמצא");
          break;
        case 429:
          console.error("יותר מדי בקשות - נסה שוב מאוחר יותר");
          break;
        case 500:
          console.error("שגיאה בשרת");
          break;
        default:
          console.error(`שגיאת שרת: ${status}`);
      }

      // החזרת שגיאה מובנית
      return Promise.reject({
        message: data.error || "שגיאה בתקשורת עם השרת",
        status,
        data,
      });
    } else if (error.request) {
      // הבקשה נשלחה אבל לא התקבלה תגובה
      console.error("אין תגובה מהשרת:", error.request);
      return Promise.reject({
        message: "השרת לא מגיב. בדוק את החיבור לאינטרנט.",
        status: 0,
        data: null,
      });
    } else {
      // שגיאה בהגדרת הבקשה
      console.error("שגיאה בהגדרת הבקשה:", error.message);
      return Promise.reject({
        message: "שגיאה בשליחת הבקשה",
        status: 0,
        data: null,
      });
    }
  }
);

// פונקציות עזר לביצוע בקשות
export const apiClient = {
  // GET request
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  async patch(url, data = {}, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// פונקציה לבדיקת בריאות השרת
export const checkServerHealth = async () => {
  try {
    const response = await apiClient.get("/health");
    return {
      isHealthy: true,
      data: response,
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message,
    };
  }
};

// ייצוא ברירת מחדל
export default api;
