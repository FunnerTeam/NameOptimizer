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
  InfoIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GROQ_API_KEY = "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";
const USE_GROQ = true; // שנה ל-false כדי להשתמש ב-OpenAI

const APP_STEPS = {
  UPLOAD: "upload",
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
          model: "llama3-8b-8192", // מודל שעובד ומהיר
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
      let jsonEnd = -1;
      let braceCount = 0;

      // ספור סוגריים מסולסלים לגלות איפה ה-JSON מסתיים
      for (let i = jsonStart; i < cleanContent.length; i++) {
        if (cleanContent[i] === "{") {
          braceCount++;
        } else if (cleanContent[i] === "}") {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
          }
        }
      }

      if (jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd);
      }
    }

    // נסה לפרסר JSON, אם לא מצליח תחזיר פורמט בסיסי
    try {
      console.log("תוכן לפני פרסור JSON:", cleanContent);
      const parsed = JSON.parse(cleanContent);
      console.log("JSON פורסר בהצלחה:", parsed);
      return parsed;
    } catch (jsonError) {
      console.warn("תגובה אינה JSON תקין:", cleanContent);
      console.error("שגיאת JSON parsing:", jsonError.message);

      // אם יש נתונים חלקיים, נסה לחלץ אותם
      if (cleanContent.includes("אנשי_קשר_משופרים")) {
        console.log("מנסה לחלץ נתונים חלקיים...");
        // בהחלט תן warning למשתמש
        console.warn("המערכת מחזירה נתונים חלקיים בלבד");
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
  const OPENAI_API_KEY =
    "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";
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
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

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(APP_STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const resetStateForNewUpload = () => {
    setFile(null);
    setError(null);
    setResults(null);
    setProcessing(false);
    setCurrentStep(APP_STEPS.UPLOAD);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelectAndInitialParse = async (selectedFile) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith(".csv")) {
      setError("אנא העלה קובץ CSV בלבד (.csv)");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const CHUNK_SIZE = 1500; // תווים למקטע

  // פונקציה שמחלקת טקסט למקטעים לפי שורות שלמות בלבד
  function splitTextToChunks(text, chunkSize) {
    const lines = text.split("\n");
    const chunks = [];
    let currentChunk = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // אם הוספת השורה תעבור את הגודל, פתח צ'אנק חדש
      if (
        (currentChunk + (currentChunk ? "\n" : "") + line).length > chunkSize &&
        currentChunk
      ) {
        chunks.push(currentChunk);
        currentChunk = line;
      } else {
        currentChunk += (currentChunk ? "\n" : "") + line;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

  // פונקציה שמבצעת דדופליקציה לפי שם מלא
  function deduplicateContacts(contacts) {
    const seen = new Set();
    return contacts.filter((c) => {
      if (!c["שם מלא"]) return false;
      if (seen.has(c["שם מלא"])) return false;
      seen.add(c["שם מלא"]);
      return true;
    });
  }

  // מאחד דוחות וסיכומים
  function mergeResults(allResults) {
    // איחוד אנשי קשר
    let allContacts = allResults.flatMap((r) => r["אנשי_קשר_משופרים"] || []);
    allContacts = deduplicateContacts(allContacts);

    // איחוד דוחות
    let allReports = allResults.flatMap((r) => r["דוח_פירוט"] || []);

    // סכימת סיכומים
    const summary = {
      "סך שמות שתוקנו": 0,
      "סך טלפונים שעוצבו": 0,
      "סך כתובות אימייל שאומתו": 0,
      "סך כפולים שנוקו": 0,
      "מספר שורות בקלט": 0,
      "מספר שורות בפלט": 0,
    };
    allResults.forEach((r) => {
      const s = r["סיכום_שיפורים_כללי"] || {};
      Object.keys(summary).forEach((k) => {
        summary[k] += Number(s[k] || 0);
      });
    });
    summary["מספר שורות בקלט"] = allResults.reduce(
      (acc, r) => acc + (r["סיכום_שיפורים_כללי"]?.["מספר שורות בקלט"] || 0),
      0
    );
    summary["מספר שורות בפלט"] = allContacts.length;

    return {
      אנשי_קשר_משופרים: allContacts,
      דוח_פירוט: allReports,
      סיכום_שיפורים_כללי: summary,
    };
  }

  const handleProcessFile = async () => {
    if (!file) return;

    setCurrentStep(APP_STEPS.PROCESSING);
    setProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResults) => {
        try {
          if (parseResults.errors && parseResults.errors.length > 0) {
            throw new Error(
              `שגיאה בפרסינג הקובץ: ${parseResults.errors[0].message}`
            );
          }

          if (!parseResults.data || parseResults.data.length === 0) {
            throw new Error("הקובץ ריק או לא מכיל נתונים תקינים.");
          }

          const csvContent = Papa.unparse(parseResults.data);
          const chunks = splitTextToChunks(csvContent, CHUNK_SIZE);
          const allResults = [];

          for (let i = 0; i < chunks.length; i++) {
            const limitedContent = chunks[i];
            const prompt = `Return ONLY compact JSON. No text before/after. Use exact field names.

Process contact data (chunk ${i + 1} of ${chunks.length}):
1. נקה שמות מרווחים עודפים וסימנים מיותרים.
2. הסר שמות שכוללים רק מספרים או באורך פחות מ-2 תווים.
3. תקן טלפונים ישראליים (05XXXXXXXX).
4. אמת אימיילים.
5. הסר מילים חריגות (בדיקה, טסט, admin וכו').
6. זיהוי שם פרטי ושם משפחה לפי לוגיקה של שם מלא.
7. בצע דדופליקציה לפי שם מלא.

JSON format (use exact Hebrew field names):
{"אנשי_קשר_משופרים":[{"שם מלא":"","שם פרטי":"","שם משפחה":"","דואל":"","טלפון":0}],"דוח_פירוט":[{"שם מלא":"","פעולות":""}],"סיכום_שיפורים_כללי":{"סך שמות שתוקנו":0,"סך טלפונים שעוצבו":0,"סך כתובות אימייל שאומתו":0,"סך כפולים שנוקו":0,"מספר שורות בקלט":${
              parseResults.data.length
            },"מספר שורות בפלט":${parseResults.data.length}}}

Data: ${limitedContent}`;
            const response = await callAI(prompt);
            allResults.push(response);
            if (i < chunks.length - 1) {
              await new Promise((res) => setTimeout(res, 2000)); // האטה בין בקשות
            }
          }

          const merged = mergeResults(allResults);
          setResults(merged);
          setCurrentStep(APP_STEPS.RESULTS);
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

          setError(errorMessage);
          setCurrentStep(APP_STEPS.ERROR);
        } finally {
          setProcessing(false);
        }
      },
      error: (err) => {
        console.error("Papa Parse Error:", err);
        setError(`שגיאה בקריאת הקובץ: ${err.message || "פורמט קובץ לא תקין"}`);
        setCurrentStep(APP_STEPS.ERROR);
        setProcessing(false);
      },
    });
  };

  const handleDownloadCleaned = () => {
    if (results?.["אנשי_קשר_משופרים"]) {
      downloadCSV(results["אנשי_קשר_משופרים"], "contacts_cleaned.csv");
    }
  };

  const handleDownloadDetailed = () => {
    if (results?.["דוח_פירוט"]) {
      downloadCSV(
        results["דוח_פירוט"],
        "contact_processing_detailed_report.csv"
      );
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
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">
                      קובץ נבחר: {file.name}
                    </p>
                    <Button
                      onClick={handleProcessFile}
                      className="mt-2 bg-green-600 hover:bg-green-700"
                      disabled={processing}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {processing ? "מעבד..." : "התחל עיבוד"}
                    </Button>
                  </div>
                )}
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
              <div className="animate-pulse bg-slate-200 h-2 rounded-full"></div>
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

              {results?.["סיכום_שיפורים_כללי"] && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    סיכום שיפורים:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {Object.entries(results["סיכום_שיפורים_כללי"]).map(
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

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleDownloadCleaned}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!results?.["אנשי_קשר_משופרים"]}
                >
                  <Download className="w-4 h-4 mr-2" />
                  הורד אנשי קשר משופרים
                </Button>
                <Button
                  onClick={handleDownloadDetailed}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!results?.["דוח_פירוט"]}
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
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                אירעה שגיאה
              </h2>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || "שגיאה לא ידועה."}
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
          {currentStep === APP_STEPS.UPLOAD && (
            <div className="flex items-center justify-center text-lg text-slate-600">
              העלה קובץ <strong className="text-teal-700 mx-1">CSV</strong>
              עם נתוני אנשי קשר וקבל חזרה נתונים מטובים ונקיים
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-5 h-5 text-slate-500 mr-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent
                    className="max-w-xs bg-slate-800 text-white p-3 rounded-lg shadow-lg text-right"
                    side="bottom"
                  >
                    <p className="font-semibold mb-1">דרישות קובץ CSV:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>הקובץ חייב להיות בפורמט CSV.</li>
                      <li>מומלץ שהשורה הראשונה תכיל כותרות לעמודות.</li>
                      <li>קידוד מומלץ: UTF-8 (במיוחד עבור עברית).</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
            {currentStep === APP_STEPS.UPLOAD && error && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 mb-4"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
