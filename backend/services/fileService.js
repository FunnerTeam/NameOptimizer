const Papa = require("papaparse");
const { v4: uuidv4 } = require("uuid");

class FileService {
  // המרת נתונים ל-CSV
  generateCSV(data) {
    try {
      const csv = Papa.unparse(data);
      // הוספת BOM לתמיכה בעברית
      return "\uFEFF" + csv;
    } catch (error) {
      console.error("שגיאה ביצירת CSV:", error);
      throw new Error("שגיאה ביצירת קובץ CSV");
    }
  }

  // יצירת שם קובץ ייחודי
  generateUniqueFileName(userEmail, originalFileName, suffix = "") {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uuid = uuidv4().slice(0, 8);
    const extension = ".csv";
    const baseName = originalFileName.replace(/\.[^/.]+$/, ""); // הסרת סיומת מקורית

    return `${userEmail}/${baseName}${suffix}_${timestamp}_${uuid}${extension}`;
  }

  // יצירת buffer מ-CSV string
  createFileBuffer(csvContent) {
    return Buffer.from(csvContent, "utf8");
  }

  // בדיקת תקינות נתוני CSV
  validateCSVData(data) {
    if (!Array.isArray(data)) {
      throw new Error("נתונים חייבים להיות מערך");
    }

    if (data.length === 0) {
      throw new Error("אין נתונים ליצוא");
    }

    // בדיקה שהרשומה הראשונה מכילה את השדות הנדרשים
    const firstRecord = data[0];
    const requiredFields = ["שם מלא"];

    for (const field of requiredFields) {
      if (!(field in firstRecord)) {
        throw new Error(`שדה חסר: ${field}`);
      }
    }

    return true;
  }

  // יצירת דוח מפורט בפורמט מובנה
  generateDetailedReport(results) {
    if (!results || !results.דוח_פירוט) {
      return [];
    }

    const detailedData = results.דוח_פירוט.map((item, index) => ({
      "מספר שורה": index + 1,
      "שם מלא": item["שם מלא"] || "",
      "פעולות שבוצעו": item.פעולות || "לא צוין",
      סטטוס: "הושלם",
      "זמן עיבוד": new Date().toISOString(),
    }));

    return detailedData;
  }

  // יצירת סיכום עיבוד בפורמט CSV
  generateSummaryReport(summary) {
    const summaryData = [
      { שדה: "סך שמות שתוקנו", כמות: summary["סך שמות שתוקנו"] || 0 },
      { שדה: "סך טלפונים שעוצבו", כמות: summary["סך טלפונים שעוצבו"] || 0 },
      {
        שדה: "סך כתובות אימייל שאומתו",
        כמות: summary["סך כתובות אימייל שאומתו"] || 0,
      },
      { שדה: "סך כפולים שנוקו", כמות: summary["סך כפולים שנוקו"] || 0 },
      { שדה: "סך שורות שנמחקו", כמות: summary["סך שורות שנמחקו"] || 0 },
      { שדה: "מספר שורות בקלט", כמות: summary["מספר שורות בקלט"] || 0 },
      { שדה: "מספר שורות בפלט", כמות: summary["מספר שורות בפלט"] || 0 },
    ];

    return summaryData;
  }

  // טיהור שם קובץ מתווים לא חוקיים
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[<>:"/\\|?*]/g, "_") // החלפת תווים לא חוקיים
      .replace(/\s+/g, "_") // החלפת רווחים
      .replace(/_{2,}/g, "_") // הפחתת קווים תחתונים כפולים
      .replace(/^_+|_+$/g, ""); // הסרת קווים תחתונים מתחילת וסוף
  }

  // חישוב גודל קובץ בבתים
  calculateFileSize(content) {
    return Buffer.byteLength(content, "utf8");
  }

  // בדיקת האם גודל קובץ מותר (מקסימום 10MB)
  isFileSizeAllowed(content, maxSizeBytes = 10 * 1024 * 1024) {
    const fileSize = this.calculateFileSize(content);
    return fileSize <= maxSizeBytes;
  }
}

module.exports = new FileService();
