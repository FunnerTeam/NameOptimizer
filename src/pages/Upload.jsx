// This is the updated UploadPage component with full OpenAI integration
// including: cleaning, summarization, and downloadable CSV results

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Save,
  Clock,
  SettingsIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// הוק אימות ושירותים
import processingService from "../services/processingService.js";
import axiosInstance from "../utils/axiosInstance.js";

const GROQ_API_KEY = "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";
const USE_GROQ = true; // true = Groq (מהיר, חינמי, יציב), false = OpenAI (יקר, מוגבל, בעייתי)

const APP_STEPS = {
  UPLOAD: "upload",
  COLUMN_MAPPING: "column_mapping",
  PROCESSING: "processing",
  RESULTS: "results",
  ERROR: "error",
};

async function callAI(prompt) {
  if (USE_GROQ) {
    return await callGroq(prompt);
  } else {
    return await callOpenAI(prompt);
  }
}

async function callGroq(prompt) {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192", // מודל משופר עם איכות גבוהה יותר
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 8000,
          stop: null,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API Error Details:", errorData);
      throw new Error(
        `Groq API Error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("תגובה לא תקינה מ-Groq");
    }

    const content = data.choices[0].message.content;

    // נקה את התגובה מטקסט מיותר ותחלץ רק JSON
    let cleanContent = content.trim();

    // אם יש הסבר לפני JSON, הסר אותו
    if (cleanContent.includes("```json")) {
      const jsonStart = cleanContent.indexOf("```json") + 7;
      const jsonEnd = cleanContent.indexOf("```", jsonStart);
      if (jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd).trim();
      }
    } else if (cleanContent.includes("{")) {
      // מצא את תחילת וסיום ה-JSON
      const jsonStart = cleanContent.indexOf("{");
      cleanContent = cleanContent.substring(jsonStart);
    }

    // נסה לפרסר JSON, אם לא מצליח נסה לתקן או תחזיר פורמט בסיסי
    try {
      console.log("תוכן לפני פרסור JSON:", cleanContent);

      // תקן טלפונים לפני פרסור - המר מספרים שמתחילים ב-0 למחרוזות
      let fixedContent = cleanContent.replace(
        /("טלפון":)(\d+)/g,
        (match, prefix, number) => {
          // אם המספר מתחיל ב-0, הוסף גרשיים
          if (number.startsWith("0")) {
            return `${prefix}"${number}"`;
          }
          return match;
        }
      );

      console.log("תוכן אחרי תיקון טלפונים:", fixedContent);

      const parsed = JSON.parse(fixedContent);
      console.log("JSON פורסר בהצלחה:", parsed);
      return parsed;
    } catch (jsonError) {
      console.warn("תגובה אינה JSON תקין:", cleanContent);
      console.error("שגיאת JSON parsing:", jsonError.message);

      // נסה לתקן JSON חלקי
      if (cleanContent.includes("אנשי_קשר_משופרים")) {
        console.log("מנסה לתקן JSON חלקי...");

        // נסה להוסיף סוגריים חסרים
        let fixedJson = cleanContent;

        // אם ה-JSON נחתך באמצע מספר טלפון, הסר את השורה הלא גמורה
        const lines = fixedJson.split("\n");
        let lastCompleteLineIndex = -1;

        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.endsWith(",") || line.endsWith("}") || line.endsWith("]")) {
            lastCompleteLineIndex = i;
            break;
          }
        }

        if (lastCompleteLineIndex > 0) {
          fixedJson = lines.slice(0, lastCompleteLineIndex + 1).join("\n");
        }

        // ספור סוגריים מסולסלים ומרובעים
        const openCurly = (fixedJson.match(/\{/g) || []).length;
        const closeCurly = (fixedJson.match(/\}/g) || []).length;
        const openSquare = (fixedJson.match(/\[/g) || []).length;
        const closeSquare = (fixedJson.match(/\]/g) || []).length;

        // הסר פסיק אחרון לפני סגירת array אם יש
        fixedJson = fixedJson.replace(/,(\s*\])/g, "$1");

        // הוסף סוגריים חסרים
        if (openSquare > closeSquare) {
          fixedJson += "]".repeat(openSquare - closeSquare);
        }
        if (openCurly > closeCurly) {
          // הוסף השדות החסרים אם הם לא קיימים
          if (!fixedJson.includes("דוח_פירוט")) {
            fixedJson += ',"דוח_פירוט":[]';
          }
          if (!fixedJson.includes("סיכום_שיפורים_כללי")) {
            fixedJson +=
              ',"סיכום_שיפורים_כללי":{"סך שמות שתוקנו":0,"סך טלפונים שעוצבו":0,"סך כתובות אימייל שאומתו":0,"סך כפולים שנוקו":0,"מספר שורות בקלט":0,"מספר שורות בפלט":0}';
          }
          fixedJson += "}".repeat(openCurly - closeCurly);
        }

        try {
          console.log("JSON מתוקן:", fixedJson);
          const parsedFixed = JSON.parse(fixedJson);
          console.log("JSON מתוקן פורסר בהצלחה:", parsedFixed);
          return parsedFixed;
        } catch (fixError) {
          console.error("גם JSON מתוקן נכשל:", fixError.message);
        }
      }

      // תחזיר פורמט בסיסי במקרה של כשל
      return {
        אנשי_קשר_משופרים: [],
        דוח_פירוט: [],
        סיכום_שיפורים_כללי: {
          "סך שמות שתוקנו": 0,
          "סך טלפונים שעוצבו": 0,
          "סך כתובות אימייל שאומתו": 0,
          "סך כתובות שעושרו": 0,
          "סך שיוכי מגדר שבוצעו": 0,
          "סך כפולים שנוקו": 0,
          "מספר שורות בקלט": 0,
          "מספר שורות בפלט": 0,
          הערה: "המערכת לא הצליחה לעבד את הנתונים בפורמט המבוקש",
        },
      };
    }
  } catch (error) {
    console.error("Groq API call failed:", error);
    throw error;
  }
}

async function callOpenAI(prompt) {
  console.log("prompt", prompt);
  const OPENAI_API_KEY =
    "sk-tuCJ7eP0hU8EzyQYaAb9wh54KzVHx9OVRZeIYaTlRET3BlbkFJD4rOAzgnxqDZT4nasdOYnnPZOde7ZZUCiTxWuIulQA";
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 100000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("429: חרגת ממכסת הבקשות של OpenAI");
      } else if (response.status === 401) {
        throw new Error("401: מפתח API לא תקין");
      } else if (response.status === 400) {
        throw new Error("400: בקשה לא תקינה - הטקסט ארוך מדי או פורמט לא נכון");
      } else {
        throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("תגובה לא תקינה מ-OpenAI");
    }

    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    if (error.message.startsWith("JSON")) {
      throw new Error("OpenAI החזיר תגובה שאינה JSON תקין");
    }
    throw error;
  }
}

function downloadCSV(data, filename) {
  const csv = Papa.unparse(data);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// פונקציה לטעינת הגדרות משתמש
async function loadUserSettings() {
  try {
    const response = await axiosInstance.get("/api/processing-settings");
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.warn("לא ניתן לטעון הגדרות משתמש, משתמש בברירות מחדל:", error);
  }

  // ברירות מחדל במקרה של שגיאה
  return {
    truecaller_usage: "never",
    truecaller_name_field: "שם מ-Truecaller",
    name_title_handling: "separate_field",
    gender_assignment: true,
    variation_handling: "standardize_add_note",
    phone_format_preference: "with_hyphen",
  };
}

// פונקציה ליצירת פרומפט דינמי לפי הגדרות משתמש
function buildPromptWithSettings(settings, singleRowCSV, rowIndex, totalRows) {
  // בניית חלק הטיפול בתארים
  let titleHandlingPrompt = "";
  switch (settings.name_title_handling) {
    case "remove":
      titleHandlingPrompt =
        'הסר רק תארי כבוד כמו: מר, גב\', ד"ר, דוקטור, פרו"פ, פרופסור, רב, הרב, רבי, מרת, גברת - אבל שמור את השם עצמו!';
      break;
    case "prefix_firstname":
      titleHandlingPrompt =
        'זהה תארי כבוד (מר, גב\', ד"ר וכו\') ושמור אותם כחלק מהשם הפרטי. דוגמה: "ד"ר יוסי כהן" ← שם פרטי: "ד"ר יוסי", שם משפחה: "כהן"';
      break;
    case "separate_field":
      titleHandlingPrompt = `זהה תארי כבוד והעבר אותם לשדה נפרד בשם 'תואר'. 
דוגמאות חובה:
- "ד"ר אלעד מאיר" → שם פרטי: "אלעד", שם משפחה: "מאיר", תואר: "ד"ר"
- "מר דוד כהן" → שם פרטי: "דוד", שם משפחה: "כהן", תואר: "מר"
- "גב' שרה לוי" → שם פרטי: "שרה", שם משפחה: "לוי", תואר: "גב'"
חובה לשמור את השם ולהעביר רק את התואר!
תארים נפוצים: ד"ר, מר, גב', גברת, מרת, פרופ', רב, הרב.`;
      break;
  }

  // בניית חלק פורמט הטלפון
  const phoneFormatExample =
    settings.phone_format_preference === "with_hyphen"
      ? "050-1234567"
      : "0501234567";

  // בניית חלק שיוך המגדר
  const genderPrompt = settings.gender_assignment
    ? "8. שיוך מגדר: נסה לזהות מגדר על בסיס השם הפרטי ורשום בשדה 'מגדר' (זכר/נקבה/לא ידוע)."
    : "";

  // בניית חלק Truecaller
  let truecallerPrompt = "";
  if (settings.truecaller_usage !== "never") {
    const truecallerFieldName =
      settings.truecaller_name_field || "שם מ-Truecaller";

    switch (settings.truecaller_usage) {
      case "if_name_missing":
        truecallerPrompt = `9. Truecaller: אם השם חסר או לא ברור, נסה להעשיר מטלפון ורשום בשדה '${truecallerFieldName}' (סימולציה - השתמש בהיגיון לשמות ישראליים נפוצים לפי אזור הטלפון).`;
        break;
      case "always_enrich":
        truecallerPrompt = `9. Truecaller: תמיד נסה להעשיר מידע מטלפון ורשום בשדה '${truecallerFieldName}' (סימולציה - השתמש בהיגיון לשמות ישראליים נפוצים לפי אזור הטלפון). אם יש בסיס טוב לשם, השאר את המקורי.`;
        break;
    }
  }

  // בניית שדות הפלט לפי הגדרות
  let outputFields = `"שם מלא":"value","שם פרטי":"value","שם משפחה":"value","דואל":"value","טלפון":"${phoneFormatExample}","פעולות":"נוקה"`;

  if (settings.name_title_handling === "separate_field") {
    outputFields = `"שם מלא":"value","שם פרטי":"value","שם משפחה":"value","תואר":"value","דואל":"value","טלפון":"${phoneFormatExample}","פעולות":"נוקה"`;
  }

  if (settings.gender_assignment) {
    outputFields += `,"מגדר":"value"`;
  }

  if (settings.truecaller_usage !== "never") {
    const truecallerFieldName =
      settings.truecaller_name_field || "שם מ-Truecaller";
    outputFields += `,"${truecallerFieldName}":"value"`;
  }

  return `Return ONLY valid JSON. No text before/after. Phone numbers must be strings with quotes.

Processing contact ${rowIndex + 1} of ${totalRows}:

CHECK IN EXACT ORDER - If any rule matches, follow it immediately:

RULE 1: DELETE - Header rows (check ANY field for these EXACT words)
"שם", "שם מלא", "שם פרטי", "שם משפחה", "טלפון", "דואל", "אימייל", "מייל"
"name", "phone", "email", "first", "last", "first name", "last name"
→ DELETE: {"שם מלא":"","שם פרטי":"","שם משפחה":"","דואל":"","טלפון":"","פעולות":"מחיקה - כותרת"}

RULE 2: KEEP - Names with titles (check if name starts with these)
Hebrew: "ד״ר", "ד"ר", "דר.", "מר", "גב׳", "גב'", "גברת", "מרת", "פרופ׳", "רב", "הרב"
English: "Dr", "Dr.", "Mr", "Mr.", "Mrs", "Mrs.", "Ms", "Ms.", "Prof"
Examples: "ד״ר אלעד מאיר", "מר דוד אברהם", "גב' שרה כהן", "Dr David Cohen"
→ KEEP AND PROCESS with title handling

RULE 3: KEEP - Hebrew compound names (check if name starts with these)
"בת", "בן", "אבי", "אבו", "עבד", "אל", "בר", "כהן", "לוי"
Examples: "בת חן עמיר", "בן דוד משה", "אבי אזולאי", "כהן דוד", "בר כוכבא"
→ KEEP AND PROCESS normally

RULE 4: KEEP - Regular valid names (Hebrew, English, mixed)
Examples: "Yosi", "David", "Shlomit", "Rachel", "John Smith", "Hay Segal", "Shuki Portal", "David דוד", "משה", "שרה"
→ KEEP AND PROCESS normally

RULE 5: DELETE - Junk only after checking all above
- Pure headers that passed rule 1: double-check and delete
- System words: "headerMenu", "PORTAL - Service", "test", "admin", "header", "menu", "portal", "service"  
- Pure symbols: "?", "!", "*", "***", "---", "@", "#", "$", "###"
- Pure numbers: "123", "456", "01234567", "2501234567"
- True gibberish: "דגכחנדךלחנגכ", "asdasd", "gggggg" (only obvious random letters)
- Under 2 real letters: "א", "x", "12"
→ DELETE: {"שם מלא":"","שם פרטי":"","שם משפחה":"","דואל":"","טלפון":"","פעולות":"מחיקה - זבל"}

PROCESSING for kept names:
${titleHandlingPrompt}
- Phone format: 
  * Israeli phones (05/02/03/04/08/09): format as ${phoneFormatExample}
  * Numbers like 537405153, 546789012: add 0 prefix → 053-740-5153, 054-678-9012
  * 10-digit numbers starting with 5: likely missing 0, add it → 05X-XXX-XXXX
  * Other numbers: leave as string without changes
  * If no phone, leave empty
- Email fixes: gmial→gmail, yahaoo→yahoo, hotnail→hotmail
- Name splitting:
  * Split at first space: everything before first space = first name, everything after = last name
  * "אלעד מאיר" → שם פרטי: "אלעד", שם משפחה: "מאיר"
  * "דוד אברהם" → שם פרטי: "דוד", שם משפחה: "אברהם"  
  * "בת חן עמיר" → שם פרטי: "בת חן", שם משפחה: "עמיר"
  * "John Smith" → שם פרטי: "John", שם משפחה: "Smith"

${genderPrompt}
${truecallerPrompt}

OUTPUT: {${outputFields}}

Data: ${singleRowCSV}`;
}

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(APP_STEPS.UPLOAD);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]); // כותרות העמודות מהקובץ
  const [columnMapping, setColumnMapping] = useState({}); // מיפוי עמודות שבחר המשתמש
  const [processedData, setProcessedData] = useState(null);
  const [detailedReport, setDetailedReport] = useState([]); // דוח מפורט חדש
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userSettings, setUserSettings] = useState(null); // הגדרות משתמש

  // Server saving states
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const fileInputRef = useRef(null);

  const resetStateForNewUpload = () => {
    setFileName("");
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setProcessedData(null);
    setDetailedReport([]); // איפוס הדוח המפורט
    setErrorMessage("");
    setIsProcessing(false);
    setProcessingStep("");
    setUploadProgress(0);
    setCurrentStep(APP_STEPS.UPLOAD);
    setSaveMessage("");
    setSaveError("");
    setUserSettings(null); // איפוס הגדרות משתמש
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelectAndInitialParse = async (selectedFile) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      setErrorMessage("אנא העלה קובץ CSV בלבד (.csv)");
      setFileName("");
      return;
    }
    setFileName(fileName);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const data = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
        }).data;
        if (data.length === 0) {
          throw new Error("הקובץ ריק או לא מכיל נתונים תקינים.");
        }
        setCsvData(data);

        // חילוץ כותרות העמודות
        const headers = Object.keys(data[0] || {});
        setCsvHeaders(headers);

        // מעבר לשלב שיוך עמודות
        setCurrentStep(APP_STEPS.COLUMN_MAPPING);
      } catch (error) {
        console.error("שגיאה בקריאת הקובץ:", error);
        setErrorMessage("שגיאה בקריאת הקובץ. אנא בדוק את הקובץ ונסה שוב.");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmColumnMapping = () => {
    // בדיקה שנבחרו לפחות השדות החובה
    const hasFullName = columnMapping["שם"];
    const hasFirstAndLast =
      columnMapping["שם_פרטי"] && columnMapping["שם_משפחה"];
    const hasPhone = columnMapping["טלפון"];

    if (!hasPhone) {
      setErrorMessage("חובה לבחור עמודה עבור טלפון");
      return;
    }

    if (!hasFullName && !hasFirstAndLast) {
      setErrorMessage("חובה לבחור שם מלא או שם פרטי ושם משפחה");
      return;
    }

    setErrorMessage("");
    setCurrentStep(APP_STEPS.PROCESSING);
    handleProcessFile();
  };

  const handleProcessFile = async () => {
    if (!csvData.length) return;

    setCurrentStep(APP_STEPS.PROCESSING);
    setIsProcessing(true);

    try {
      const allResults = [];
      const allDetailedReports = []; // מערך נפרד לדוח המפורט
      const totalRows = csvData.length;
      let deletedRows = 0;

      // טעינת הגדרות משתמש
      const loadedSettings = await loadUserSettings();
      setUserSettings(loadedSettings);

      for (let i = 0; i < totalRows; i++) {
        const singleRow = csvData[i];

        // יצירת שורה חדשה עם שמות עמודות סטנדרטיים לפי המיפוי של המשתמש
        const mappedRow = {};

        // טיפול בשמות - שם מלא או שם פרטי + משפחה
        if (columnMapping["שם"]) {
          // יש שם מלא - הפרומפט יפצל אותו
          mappedRow["שם מלא"] = singleRow[columnMapping["שם"]] || "";
        } else if (columnMapping["שם_פרטי"] || columnMapping["שם_משפחה"]) {
          // יש שמות נפרדים - העבר אותם כנפרדים + יצור שם מלא
          const firstName = singleRow[columnMapping["שם_פרטי"]] || "";
          const lastName = singleRow[columnMapping["שם_משפחה"]] || "";
          mappedRow["שם מלא"] = `${firstName} ${lastName}`.trim();
          mappedRow["שם פרטי"] = firstName;
          mappedRow["שם משפחה"] = lastName;
        }

        if (columnMapping["טלפון"]) {
          mappedRow["טלפון"] = singleRow[columnMapping["טלפון"]] || "";
        }
        if (columnMapping["אימייל"]) {
          mappedRow["דואל"] = singleRow[columnMapping["אימייל"]] || "";
        }
        if (columnMapping["כתובת"]) {
          mappedRow["כתובת"] = singleRow[columnMapping["כתובת"]] || "";
        }

        const singleRowCSV = Papa.unparse([mappedRow]);

        const currentName = mappedRow["שם מלא"] || `שורה ${i + 1}`;
        setProcessingStep(currentName);
        setUploadProgress(Math.round((i / totalRows) * 100));

        const prompt = buildPromptWithSettings(
          loadedSettings,
          singleRowCSV,
          i,
          totalRows
        );

        const response = await callAI(prompt);

        let fixedResponse = response;
        if (response && typeof response === "object") {
          const values = Object.values(response);
          if (
            values.some((v) =>
              [
                "שם מלא",
                "שם פרטי",
                "שם משפחה",
                "דואל",
                "טלפון",
                "פעולות",
              ].includes(v)
            )
          ) {
            console.log("זוהה JSON הפוך, מתקן...", response);
            fixedResponse = {};
            for (const [key, value] of Object.entries(response)) {
              if (
                typeof value === "string" &&
                [
                  "שם מלא",
                  "שם פרטי",
                  "שם משפחה",
                  "דואל",
                  "טלפון",
                  "פעולות",
                ].includes(value)
              ) {
                fixedResponse[value] = key;
              } else {
                fixedResponse[key] = value;
              }
            }
            console.log("JSON מתוקן:", fixedResponse);
          }
        }

        // יצירת רשומה מפורטת לדוח (כל שורה - גם שנמחקו)
        const detailedRecord = {
          "מספר שורה": i + 1,
        };

        // הוספת כל העמודות המקוריות
        Object.keys(singleRow).forEach((column) => {
          detailedRecord[`${column} (מקורי)`] = singleRow[column] || "";
        });

        // בדיקה אם השורה תקינה או נמחקת
        const isValidRow =
          fixedResponse &&
          fixedResponse["שם מלא"] &&
          fixedResponse["שם מלא"].trim().length > 1;

        if (isValidRow) {
          // הוספת עמודות לאחר תיקון - דינמי לפי הגדרות
          detailedRecord["שם מלא (לאחר תיקון)"] = fixedResponse["שם מלא"] || "";
          detailedRecord["שם פרטי (לאחר תיקון)"] =
            fixedResponse["שם פרטי"] || "";
          detailedRecord["שם משפחה (לאחר תיקון)"] =
            fixedResponse["שם משפחה"] || "";

          // תואר (רק אם מופעל בהגדרות)
          if (loadedSettings.name_title_handling === "separate_field") {
            detailedRecord["תואר (לאחר תיקון)"] = fixedResponse["תואר"] || "";
          }

          detailedRecord["דואל (לאחר תיקון)"] = fixedResponse["דואל"] || "";
          detailedRecord["טלפון (לאחר תיקון)"] = fixedResponse["טלפון"] || "";

          // מגדר (רק אם מופעל בהגדרות)
          if (loadedSettings.gender_assignment) {
            detailedRecord["מגדר (לאחר תיקון)"] = fixedResponse["מגדר"] || "";
          }

          // Truecaller (רק אם מופעל בהגדרות)
          if (loadedSettings.truecaller_usage !== "never") {
            const truecallerField =
              loadedSettings.truecaller_name_field || "שם מ-Truecaller";
            detailedRecord[`${truecallerField} (לאחר תיקון)`] =
              fixedResponse[truecallerField] || "";
          }

          detailedRecord["פעולות"] = fixedResponse["פעולות"] || "עובד";
          detailedRecord["סטטוס"] = "נשמר";

          allResults.push(fixedResponse);
        } else {
          // שורה נמחקה
          detailedRecord["שם מלא (לאחר תיקון)"] = "";
          detailedRecord["שם פרטי (לאחר תיקון)"] = "";
          detailedRecord["שם משפחה (לאחר תיקון)"] = "";

          // שדות נוספים ריקים לשורות שנמחקו
          if (loadedSettings.name_title_handling === "separate_field") {
            detailedRecord["תואר (לאחר תיקון)"] = "";
          }

          detailedRecord["דואל (לאחר תיקון)"] = "";
          detailedRecord["טלפון (לאחר תיקון)"] = "";

          if (loadedSettings.gender_assignment) {
            detailedRecord["מגדר (לאחר תיקון)"] = "";
          }

          if (loadedSettings.truecaller_usage !== "never") {
            const truecallerField =
              loadedSettings.truecaller_name_field || "שם מ-Truecaller";
            detailedRecord[`${truecallerField} (לאחר תיקון)`] = "";
          }

          detailedRecord["פעולות"] = "שורה נמחקה - שם לא תקין או קצר מדי";
          detailedRecord["סטטוס"] = "נמחק";

          deletedRows++;
          console.warn(`שורה ${i + 1} נמחקה - שם לא תקין:`, fixedResponse);
        }

        allDetailedReports.push(detailedRecord);

        // המתנה בין קריאות למניעת rate limiting (100 בקשות לדקה = ~600ms בין בקשות)
        if (i < totalRows - 1) {
          await new Promise((resolve) => setTimeout(resolve, 650));
        }
      }

      function deduplicateContacts(contacts) {
        const seen = new Set();
        const uniqueContacts = [];
        const duplicateNames = new Set(); // שמות שהם כפולות
        const firstOccurrence = new Map(); // מיפוי שם לאינדקס הופעה ראשונה

        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          const name = contact["שם מלא"]
            ? contact["שם מלא"].trim().toLowerCase()
            : "";

          if (name.length <= 1) continue; // שמות לא תקינים

          if (!seen.has(name)) {
            seen.add(name);
            firstOccurrence.set(name, i);
            uniqueContacts.push(contact);
          } else {
            duplicateNames.add(name);
          }
        }

        return { uniqueContacts, duplicateNames, firstOccurrence };
      }

      const deduplicationResult = deduplicateContacts(allResults);
      const processedContacts = deduplicationResult.uniqueContacts;
      const duplicateNames = deduplicationResult.duplicateNames;
      const firstOccurrence = deduplicationResult.firstOccurrence;
      const duplicatesRemoved = allResults.length - processedContacts.length;

      // עדכון הדוח המפורט עבור כפולות
      let validResultIndex = 0;
      allDetailedReports.forEach((report) => {
        if (report["סטטוס"] === "נשמר") {
          const resultContact = allResults[validResultIndex];
          const contactName = resultContact["שם מלא"]
            ? resultContact["שם מלא"].trim().toLowerCase()
            : "";

          // בדוק אם זה כפול ולא הופעה ראשונה
          if (
            duplicateNames.has(contactName) &&
            firstOccurrence.get(contactName) !== validResultIndex
          ) {
            report["סטטוס"] = "נמחק";
            report["פעולות"] = report["פעולות"] + " + נמחק כשורה כפולה";
          }

          validResultIndex++;
        }
      });

      const totalDeletedRows = deletedRows + duplicatesRemoved;

      const reportDetails = allResults.map((contact) => {
        const details = {
          "שם מלא": contact["שם מלא"] || "",
          פעולות: contact["פעולות"] || "עובד",
        };

        // הוספת שדות נוספים לפי הגדרות
        if (loadedSettings.name_title_handling === "separate_field") {
          details["תואר"] = contact["תואר"] || "";
        }

        if (loadedSettings.gender_assignment) {
          details["מגדר"] = contact["מגדר"] || "";
        }

        if (loadedSettings.truecaller_usage !== "never") {
          const truecallerField =
            loadedSettings.truecaller_name_field || "שם מ-Truecaller";
          details[truecallerField] = contact[truecallerField] || "";
        }

        return details;
      });

      const finalResults = {
        אנשי_קשר_משופרים: processedContacts,
        דוח_פירוט: reportDetails,
        סיכום_שיפורים_כללי: {
          "סך שמות שתוקנו": processedContacts.length,
          "סך טלפונים שעוצבו": processedContacts.filter(
            (c) => c.טלפון && c.טלפון.startsWith("05")
          ).length,
          "סך כתובות אימייל שאומתו": processedContacts.filter(
            (c) => c.דואל && c.דואל.includes("@")
          ).length,
          ...(loadedSettings.gender_assignment && {
            "סך שיוכי מגדר שבוצעו": processedContacts.filter(
              (c) => c["מגדר"] && c["מגדר"] !== "לא ידוע"
            ).length,
          }),
          ...(loadedSettings.name_title_handling === "separate_field" && {
            "סך תארים שהועברו לשדה נפרד": processedContacts.filter(
              (c) => c["תואר"] && c["תואר"].trim().length > 0
            ).length,
          }),
          ...(loadedSettings.truecaller_usage !== "never" && {
            [`סך העשרות ${
              loadedSettings.truecaller_name_field || "Truecaller"
            }`]: processedContacts.filter((c) => {
              const truecallerField =
                loadedSettings.truecaller_name_field || "שם מ-Truecaller";
              return c[truecallerField] && c[truecallerField].trim().length > 0;
            }).length,
          }),
          "סך כפולים שנוקו": duplicatesRemoved,
          "סך שורות שנמחקו": totalDeletedRows,
          "מספר שורות בקלט": totalRows,
          "מספר שורות בפלט": processedContacts.length,
        },
      };

      setProcessedData(finalResults);
      setDetailedReport(allDetailedReports); // שמירת הדוח המפורט
      setProcessingStep("עיבוד הושלם!");
      setUploadProgress(100);
      setCurrentStep(APP_STEPS.RESULTS);

      // חיכוי קצר לפני השמירה
      setTimeout(async () => {
        setIsSavingToServer(true);
        setSaveError("");

        const saveData = {
          originalFilename: fileName,
          totalRows: totalRows,
          cleanedData: processedContacts,
          detailedData: allDetailedReports,
          summary: finalResults["סיכום_שיפורים_כללי"],
        };

        const saveResult = await processingService.saveProcessingResults(
          saveData
        );

        if (saveResult.success) {
          setSaveMessage(
            "✅ הקבצים נשמרו בהצלחה בהיסטוריה (זמינים למשך 24 שעות)"
          );
        } else {
          throw new Error(saveResult.error || "שגיאה לא ידועה בשמירה");
        }

        setIsSavingToServer(false);
      }, 2000);

      // קבצים מוכנים להורדה - אבל לא נוריד אוטומטית
      console.log("קבצים מוכנים להורדה:", {
        processedContacts: allResults.length,
        detailedReport: allDetailedReports.length,
      });

      // שליחה לשרת בברקע (ללא הורדה אוטומטית)
      if (allResults.length > 0) {
        const processedCsv = Papa.unparse(allResults);
        const detailedCsv = Papa.unparse(allDetailedReports);

        const processedFile = new File(
          [
            new Uint8Array([0xef, 0xbb, 0xbf]),
            new TextEncoder().encode(processedCsv),
          ],
          "contacts_processed.csv",
          { type: "text/csv" }
        );

        const detailedFile = new File(
          [
            new Uint8Array([0xef, 0xbb, 0xbf]),
            new TextEncoder().encode(detailedCsv),
          ],
          "detailed_report.csv",
          { type: "text/csv" }
        );

        const formData = new FormData();
        formData.append("processedFile", processedFile);
        formData.append("detailedFile", detailedFile);
        formData.append(
          "summary",
          JSON.stringify({
            totalRows,
            processedRows: allResults.length,
            deletedRows,
          })
        );
      }
    } catch (err) {
      console.error("Error during processing:", err);
      let errorMessage;
      if (err.message && err.message.includes("429")) {
        errorMessage =
          "חרגת ממכסת הבקשות של OpenAI. נסה שוב בעוד כמה דקות או בדוק את מפתח ה-API שלך.";
      } else if (err.message && err.message.includes("401")) {
        errorMessage = "מפתח ה-API לא תקין. אנא בדוק את המפתח.";
      } else {
        errorMessage = err.message || "שגיאה בעת עיבוד הנתונים.";
      }
      setErrorMessage(errorMessage);
      setCurrentStep(APP_STEPS.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCleaned = () => {
    if (processedData?.["אנשי_קשר_משופרים"]) {
      downloadCSV(processedData["אנשי_קשר_משופרים"], "contacts_processed.csv");
    }
  };

  const handleDownloadDetailed = () => {
    if (detailedReport && detailedReport.length > 0) {
      downloadCSV(detailedReport, "detailed_report.csv");
    }
  };

  const handleDragEvents = (e, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelectAndInitialParse(droppedFile);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case APP_STEPS.UPLOAD:
        return (
          <Card className="glass-effect hover-lift border-0 shadow-xl">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-300 hover:border-teal-400"
                }`}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  גרור קובץ CSV לכאן או לחץ לבחירה
                </h3>
                <p className="text-slate-500 mb-4">
                  קבצי CSV עד 10MB. מומלץ קידוד UTF-8 לתמיכה בעברית.
                </p>
                <div className="mb-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href="/processing-defaults"
                          className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 underline"
                        >
                          <SettingsIcon className="w-4 h-4 mr-1" />
                          התאם הגדרות עיבוד
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          קובע כיצד המערכת תטפל בנתונים (תארים, פורמט טלפון,
                          מגדר וכו')
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    handleFileSelectAndInitialParse(e.target.files[0])
                  }
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  בחר קובץ CSV
                </Button>
                {fileName && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">
                      קובץ נבחר: {fileName}
                    </p>
                    <Button
                      onClick={handleConfirmColumnMapping}
                      className="mt-2 bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isProcessing ? "מעבד..." : "התחל עיבוד"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case APP_STEPS.COLUMN_MAPPING:
        return (
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <SettingsIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  שיוך עמודות
                </h2>
                <p className="text-slate-600">
                  בחר איזו עמודה בקובץ מתאימה לכל שדה במערכת
                </p>
              </div>

              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  {
                    key: "שם",
                    label: "שם מלא",
                    required: false,
                    description: "העמודה שמכילה את השם המלא של איש הקשר",
                  },
                  {
                    key: "שם_פרטי",
                    label: "שם פרטי",
                    required: false,
                    description: "העמודה שמכילה רק את השם הפרטי",
                  },
                  {
                    key: "שם_משפחה",
                    label: "שם משפחה",
                    required: false,
                    description: "העמודה שמכילה רק את שם המשפחה",
                  },
                  {
                    key: "טלפון",
                    label: "מספר טלפון",
                    required: true,
                    description: "העמודה שמכילה את מספר הטלפון",
                  },
                  {
                    key: "אימייל",
                    label: "כתובת אימייל",
                    required: false,
                    description: "העמודה שמכילה כתובת אימייל (אופציונלי)",
                  },
                  {
                    key: "כתובת",
                    label: "כתובת",
                    required: false,
                    description: "העמודה שמכילה כתובת מגורים (אופציונלי)",
                  },
                ].map((field) => (
                  <div key={field.key} className="bg-slate-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 mr-1">*</span>
                      )}
                    </label>
                    <select
                      value={columnMapping[field.key] || ""}
                      onChange={(e) =>
                        setColumnMapping((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">-- בחר עמודה --</option>
                      {csvHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {field.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-800 mb-2">
                  תצוגה מקדימה מהקובץ:
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-blue-100">
                        {csvHeaders.map((header) => (
                          <th
                            key={header}
                            className="px-3 py-2 text-right border border-blue-200 font-medium text-blue-900"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, index) => (
                        <tr key={index} className="bg-white">
                          {csvHeaders.map((header) => (
                            <td
                              key={header}
                              className="px-3 py-2 border border-blue-200 text-blue-800"
                            >
                              {row[header] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvData.length > 3 && (
                  <p className="text-xs text-blue-600 mt-2">
                    מוצגות 3 שורות ראשונות מתוך {csvData.length} שורות
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleConfirmColumnMapping}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={
                    !columnMapping["טלפון"] ||
                    (!columnMapping["שם"] &&
                      !(columnMapping["שם_פרטי"] && columnMapping["שם_משפחה"]))
                  }
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  התחל עיבוד
                </Button>
                <Button
                  onClick={resetStateForNewUpload}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  בחר קובץ אחר
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case APP_STEPS.PROCESSING:
        return (
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                מעבד את הנתונים...
              </h2>
              <p className="text-slate-600 mb-4">
                האינטלגנציה המלאכותית מנתחת ומשפרת את אנשי הקשר שלך
              </p>

              <div className="mb-4">
                <div className="bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {uploadProgress}% הושלם
                </p>
              </div>

              {processingStep && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600">מעבד כעת:</p>
                  <p className="font-medium text-slate-800">{processingStep}</p>
                </div>
              )}

              {userSettings && (
                <div className="mt-4 bg-teal-50 p-3 rounded-lg text-right">
                  <p className="text-sm text-teal-700 font-medium mb-2">
                    הגדרות עיבוד פעילות:
                  </p>
                  <div className="text-xs text-teal-600 space-y-1">
                    <p>
                      • טיפול בתארים:{" "}
                      {userSettings.name_title_handling === "remove"
                        ? "הסר תארים"
                        : userSettings.name_title_handling ===
                          "prefix_firstname"
                        ? "הוסף לשם פרטי"
                        : "העבר לשדה נפרד"}
                    </p>
                    <p>
                      • פורמט טלפון:{" "}
                      {userSettings.phone_format_preference === "with_hyphen"
                        ? "עם מקף"
                        : "רק ספרות"}
                    </p>
                    <p>
                      • שיוך מגדר:{" "}
                      {userSettings.gender_assignment ? "מופעל" : "כבוי"}
                    </p>
                    <p>
                      • Truecaller:{" "}
                      {userSettings.truecaller_usage === "never"
                        ? "כבוי"
                        : userSettings.truecaller_usage === "if_name_missing"
                        ? "רק כשחסר שם"
                        : "תמיד העשר"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case APP_STEPS.RESULTS:
        return (
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  העיבוד הושלם בהצלחה!
                </h2>
              </div>

              {saveMessage && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <Save className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    {saveMessage}
                  </AlertDescription>
                </Alert>
              )}

              {saveError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              {isSavingToServer && (
                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                  <AlertDescription className="text-blue-700">
                    שומר בהיסטוריה...
                  </AlertDescription>
                </Alert>
              )}

              {processedData?.["סיכום_שיפורים_כללי"] && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    סיכום שיפורים:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {Object.entries(processedData["סיכום_שיפורים_כללי"]).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="text-center p-2 bg-white rounded border"
                        >
                          <div className="font-bold text-teal-600 text-lg">
                            {value}
                          </div>
                          <div className="text-slate-600">{key}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {userSettings && (
                <div className="mb-6 p-4 bg-teal-50 rounded-lg text-right">
                  <h3 className="font-semibold text-teal-800 mb-3">
                    הגדרות שהוחלו בעיבוד:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-3 rounded">
                      <span className="font-medium text-teal-700">
                        טיפול בתארים:
                      </span>
                      <div className="text-teal-600 mt-1">
                        {userSettings.name_title_handling === "remove"
                          ? "הסר תארים"
                          : userSettings.name_title_handling ===
                            "prefix_firstname"
                          ? "הוסף לשם פרטי"
                          : "העבר לשדה נפרד"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <span className="font-medium text-teal-700">
                        פורמט טלפון:
                      </span>
                      <div className="text-teal-600 mt-1">
                        {userSettings.phone_format_preference === "with_hyphen"
                          ? "עם מקף (050-1234567)"
                          : "רק ספרות (0501234567)"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <span className="font-medium text-teal-700">
                        שיוך מגדר:
                      </span>
                      <div className="text-teal-600 mt-1">
                        {userSettings.gender_assignment
                          ? "מופעל - נוסף מגדר משוער"
                          : "כבוי"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <span className="font-medium text-teal-700">
                        טיפול בווריאציות:
                      </span>
                      <div className="text-teal-600 mt-1">
                        {userSettings.variation_handling ===
                        "standardize_add_note"
                          ? "תקנן והוסף הערה"
                          : "השאר מקורי"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <span className="font-medium text-teal-700">
                        Truecaller:
                      </span>
                      <div className="text-teal-600 mt-1">
                        {userSettings.truecaller_usage === "never"
                          ? "כבוי"
                          : userSettings.truecaller_usage === "if_name_missing"
                          ? "העשר רק כשחסר שם"
                          : "תמיד העשר מטלפון"}
                      </div>
                    </div>
                  </div>

                  {/* מידע על שדות נוספים שנוצרו */}
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h4 className="font-medium text-emerald-800 mb-2">
                      שדות נוספים ב-CSV:
                    </h4>
                    <div className="text-xs text-emerald-700 space-y-1">
                      {userSettings.name_title_handling ===
                        "separate_field" && (
                        <p>✓ שדה "תואר" - תארי כבוד שהועברו לשדה נפרד</p>
                      )}
                      {userSettings.gender_assignment && (
                        <p>✓ שדה "מגדר" - שיוך מגדר אוטומטי לפי השם</p>
                      )}
                      {userSettings.truecaller_usage !== "never" && (
                        <p>
                          ✓ שדה "
                          {userSettings.truecaller_name_field ||
                            "שם מ-Truecaller"}
                          " - העשרת מידע מטלפון
                        </p>
                      )}
                      {!userSettings.gender_assignment &&
                        userSettings.name_title_handling !== "separate_field" &&
                        userSettings.truecaller_usage === "never" && (
                          <p className="text-slate-500">לא נוצרו שדות נוספים</p>
                        )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleDownloadCleaned}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!processedData?.["אנשי_קשר_משופרים"]}
                >
                  <Download className="w-4 h-4 mr-2" />
                  הורד אנשי קשר משופרים
                </Button>
                <Button
                  onClick={handleDownloadDetailed}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!detailedReport || detailedReport.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  הורד דוח מפורט
                </Button>
                <Button
                  onClick={resetStateForNewUpload}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  העלה קובץ חדש
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case APP_STEPS.ERROR:
        return (
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                אירעה שגיאה
              </h2>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage || "שגיאה לא ידועה."}
                </AlertDescription>
              </Alert>
              <Button onClick={resetStateForNewUpload} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                העלה קובץ חדש
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (currentStep) {
      case APP_STEPS.UPLOAD:
        return "העלאת קובץ CSV";
      case APP_STEPS.COLUMN_MAPPING:
        return "שיוך עמודות";
      case APP_STEPS.PROCESSING:
        return "עיבוד נתונים";
      case APP_STEPS.RESULTS:
        return "תוצאות העיבוד";
      case APP_STEPS.ERROR:
        return "שגיאה בתהליך";
      default:
        return "טיוב והעשרת נתונים";
    }
  };

  const getPageIcon = () => {
    switch (currentStep) {
      case APP_STEPS.UPLOAD:
        return <Upload className="w-8 h-8 text-white" />;
      case APP_STEPS.COLUMN_MAPPING:
        return <SettingsIcon className="w-8 h-8 text-white" />;
      case APP_STEPS.PROCESSING:
        return <Sparkles className="w-8 h-8 text-white" />;
      case APP_STEPS.RESULTS:
        return <CheckCircle className="w-8 h-8 text-white" />;
      case APP_STEPS.ERROR:
        return <AlertCircle className="w-8 h-8 text-white" />;
      default:
        return <Sparkles className="w-8 h-8 text-white" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${
                currentStep === APP_STEPS.ERROR
                  ? "from-red-500 to-rose-600"
                  : "from-teal-600 to-emerald-600"
              } rounded-2xl flex items-center justify-center`}
            >
              {getPageIcon()}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            {getPageTitle()}
          </h1>
          {currentStep === APP_STEPS.UPLOAD && errorMessage && (
            <Alert
              variant="destructive"
              className="border-red-200 bg-red-50 mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
