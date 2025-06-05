import axiosInstance from "../utils/axiosInstance";
import Papa from "papaparse";

class ProcessingService {
  /**
   * שמירת תוצאות עיבוד בשרת עם אימות
   * @param {Object} data - נתוני העיבוד לשמירה
   * @returns {Promise<Object>} תוצאת השמירה
   */
  async saveProcessingResults(data) {
    try {
      console.log("🔄 שומר תוצאות עיבוד בשרת...");

      const { originalFilename, cleanedData, detailedData, summary } = data;

      // בדיקת נתונים נדרשים
      if (!originalFilename || !cleanedData || !Array.isArray(cleanedData)) {
        throw new Error("נתונים חובה חסרים או לא תקינים");
      }

      // יצירת קבצי CSV עם BOM לעברית
      const BOM = new Uint8Array([0xef, 0xbb, 0xbf]); // UTF-8 BOM

      // קובץ מנוקה
      const cleanedCSV = Papa.unparse(cleanedData, {
        header: true,
        encoding: "utf8",
      });

      // המרה לUTF-8 bytes
      const encoder = new TextEncoder();
      const cleanedBytes = encoder.encode(cleanedCSV);

      // שילוב BOM + נתונים
      const cleanedBuffer = new Uint8Array(BOM.length + cleanedBytes.length);
      cleanedBuffer.set(BOM, 0);
      cleanedBuffer.set(cleanedBytes, BOM.length);

      const cleanedBlob = new Blob([cleanedBuffer], {
        type: "text/csv;charset=utf-8",
      });

      // קובץ מפורט (אם קיים)
      let detailedBlob = null;
      if (detailedData && Array.isArray(detailedData)) {
        const detailedCSV = Papa.unparse(detailedData, {
          header: true,
          encoding: "utf8",
        });

        // המרה לUTF-8 bytes
        const detailedBytes = encoder.encode(detailedCSV);

        // שילוב BOM + נתונים
        const detailedBuffer = new Uint8Array(
          BOM.length + detailedBytes.length
        );
        detailedBuffer.set(BOM, 0);
        detailedBuffer.set(detailedBytes, BOM.length);

        detailedBlob = new Blob([detailedBuffer], {
          type: "text/csv;charset=utf-8",
        });
      }

      // יצירת FormData
      const formData = new FormData();
      formData.append("originalFilename", originalFilename);
      formData.append("totalRows", data.totalRows || cleanedData.length);
      formData.append("summary", JSON.stringify(summary || {}));
      formData.append(
        "cleanedFile",
        cleanedBlob,
        `${originalFilename}_cleaned.csv`
      );

      if (detailedBlob) {
        formData.append(
          "detailedFile",
          detailedBlob,
          `${originalFilename}_detailed.csv`
        );
      }

      // שליחה כ-FormData (axios מטפל ב-headers אוטומטית)
      const response = await axiosInstance.post(
        "/api/save-processing",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        console.log("✅ תוצאות נשמרו בהצלחה");
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.error || "שגיאה לא ידועה בשמירה");
      }
    } catch (error) {
      console.error("❌ שגיאה בשמירת תוצאות:", error);

      const errorMessage = this.extractErrorMessage(error);

      return {
        success: false,
        error: errorMessage,
        details: error.response?.data || null,
      };
    }
  }

  /**
   * קבלת היסטוריית עיבודים של המשתמש המחובר
   * @returns {Promise<Object>} רשימת העיבודים
   */
  async getProcessingHistory() {
    try {
      console.log("🔄 מושך היסטוריית עיבודים...");

      const response = await axiosInstance.get("/api/processing-history");

      if (response.data.success) {
        console.log(`✅ נמצאו ${response.data.count} עיבודים`);
        return {
          success: true,
          data: response.data.data || [],
          count: response.data.count || 0,
        };
      } else {
        throw new Error(response.data.error || "שגיאה בקבלת היסטוריה");
      }
    } catch (error) {
      console.error("❌ שגיאה בקבלת היסטוריה:", error);

      const errorMessage = this.extractErrorMessage(error);

      return {
        success: false,
        error: errorMessage,
        data: [],
        count: 0,
      };
    }
  }

  /**
   * מחיקת רשומת עיבוד
   * @param {string} id - מזהה הרשומה למחיקה
   * @returns {Promise<Object>} תוצאת המחיקה
   */
  async deleteProcessing(id) {
    try {
      console.log(`🔄 מוחק רשומה: ${id}`);

      if (!id) {
        throw new Error("מזהה רשומה נדרש");
      }

      const response = await axiosInstance.delete(`/api/processing/${id}`);

      if (response.data.success) {
        console.log("✅ רשומה נמחקה בהצלחה");
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.error || "שגיאה במחיקת רשומה");
      }
    } catch (error) {
      console.error("❌ שגיאה במחיקת רשומה:", error);

      const errorMessage = this.extractErrorMessage(error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * הורדת קובץ מURL (עם בדיקת תוקף)
   * @param {string} url - URL של הקובץ
   * @param {string} filename - שם הקובץ להורדה
   * @returns {Promise<void>}
   */
  async downloadFile(url, filename) {
    try {
      console.log(`🔄 מוריד קובץ: ${filename}`);

      if (!url || !filename) {
        throw new Error("URL ושם קובץ נדרשים");
      }

      // בדיקת תקינות URL
      if (!url.startsWith("http")) {
        throw new Error("URL לא תקין");
      }

      // יצירת element זמני להורדה
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank"; // פתיחה בחלון חדש כגיבוי

      // הוספה למסמך, לחיצה והסרה
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ הורדה התחילה");
    } catch (error) {
      console.error("❌ שגיאה בהורדת קובץ:", error);
      throw new Error(`שגיאה בהורדת קובץ: ${error.message}`);
    }
  }

  /**
   * בדיקת תוקף קובץ (האם עדיין זמין)
   * @param {string} expiresAt - תאריך תפוגה
   * @returns {Object} מידע על התוקף
   */
  checkFileExpiry(expiresAt) {
    try {
      if (!expiresAt) {
        return { isExpired: true, message: "אין תאריך תפוגה" };
      }

      const expiryDate = new Date(expiresAt);
      const now = new Date();
      const isExpired = now > expiryDate;

      if (isExpired) {
        return {
          isExpired: true,
          message: "קובץ פג תוקף",
          expiredAt: expiryDate,
        };
      }

      // חישוב זמן נותר
      const timeLeft = expiryDate - now;
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor(
        (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
      );

      return {
        isExpired: false,
        message: `נותרו ${hoursLeft} שעות ו-${minutesLeft} דקות`,
        expiresAt: expiryDate,
        timeLeft: timeLeft,
      };
    } catch (error) {
      console.error("שגיאה בבדיקת תוקף:", error);
      return { isExpired: true, message: "שגיאה בבדיקת תוקף" };
    }
  }

  /**
   * בדיקת זמינות השרת
   * @returns {Promise<Object>} סטטוס השרת
   */
  async checkServerStatus() {
    try {
      const response = await axiosInstance.get("/api/health", {
        timeout: 5000,
      });

      if (response.data && response.data.status === "OK") {
        return {
          isOnline: true,
          message: "השרת זמין",
          serverTime: response.data.timestamp,
        };
      } else {
        throw new Error("תגובה לא צפויה מהשרת");
      }
    } catch (error) {
      console.error("שרת לא זמין:", error);
      return {
        isOnline: false,
        message: "השרת לא זמין",
        error: error.message,
      };
    }
  }

  /**
   * חילוץ הודעת שגיאה מאובייקט שגיאה
   * @param {Error} error - אובייקט השגיאה
   * @returns {string} הודעת שגיאה ברורה
   */
  extractErrorMessage(error) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.message) {
      return error.message;
    }

    if (error.code === "ECONNABORTED") {
      return "פג זמן ההמתנה לשרת";
    }

    if (error.code === "ERR_NETWORK") {
      return "בעיית רשת - בדוק את החיבור לאינטרנט";
    }

    return "שגיאה לא ידועה";
  }

  /**
   * פורמט גודל קובץ לתצוגה
   * @param {number} bytes - גודל בבייטים
   * @returns {string} גודל מפורמט
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * פורמט תאריך לתצוגה
   * @param {string} dateString - תאריך כstring
   * @returns {string} תאריך מפורמט
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "תאריך לא תקין";
    }
  }
}

// יצירת instance יחיד
const processingService = new ProcessingService();

export default processingService;
