import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, Wand2, Upload, Check, FileText } from "lucide-react";
import { motion } from "framer-motion";

// שדות היעד שאנו רוצים למפות אליהם
export const TARGET_FIELDS = [
  { id: "שם", label: "שם מלא" },
  { id: "שם_פרטי", label: "שם פרטי" },
  { id: "שם_משפחה", label: "שם משפחה" },
  { id: "כינוי", label: "כינוי" },
  { id: "תואר", label: "תואר" },
  { id: "אימייל", label: 'דוא"ל' },
  { id: "טלפון", label: "טלפון" },
  { id: "כתובת_מלאה", label: "כתובת מלאה" },
  { id: "כתובת_רחוב", label: "כתובת רחוב" },
  { id: "כתובת_עיר", label: "כתובת עיר" },
];

// פונקציה למיפוי אוטומטי באמצעות AI
const performAutoMapping = async (csvHeaders, sampleData) => {
  try {
    // יצירת פרומפט למודל AI
    const prompt = `אתה מומחה למיפוי נתונים. עליך לזהות איזו עמודה בקובץ CSV מתאימה לאיזה שדה.

כותרות בקובץ: ${csvHeaders.join(", ")}

דוגמאות נתונים (5 שורות ראשונות):
${sampleData
  .slice(0, 5)
  .map(
    (row, i) =>
      `שורה ${i + 1}: ${csvHeaders
        .map((header) => `${header}="${row[header] || "ריק"}"`)
        .join(", ")}`
  )
  .join("\n")}

שדות זמינים למיפוי:
- שם: שם מלא של האדם (דוגמה: "דוד כהן", "שרה לוי")
- שם_פרטי: שם פרטי בלבד (דוגמה: "דוד", "שרה")  
- שם_משפחה: שם משפחה בלבד (דוגמה: "כהן", "לוי")
- כינוי: כינוי או שם קצר (דוגמה: "דודו", "שרי")
- תואר: תואר אקדמי או מקצועי (דוגמה: "ד״ר", "מר", "גב׳")
- אימייל: כתובת דואר אלקטרוני (דוגמה: "user@example.com")
- טלפון: מספר טלפון (דוגמה: "050-1234567", "0501234567")
- כתובת_מלאה: כתובת מלאה (דוגמה: "רחוב הרצל 1, תל אביב")
- כתובת_רחוב: רק שם הרחוב והמספר (דוגמה: "רחוב הרצל 1")
- כתובת_עיר: רק שם העיר (דוגמה: "תל אביב", "חיפה")

חשוב: תחזיר רק JSON תקין ללא טקסט נוסף!
פורמט: {"שדה_יעד": "כותרת_מהקובץ"}
רק עבור שדות שאתה בטוח בהם מעל 80%.

דוגמה: {"שם": "שם מלא", "טלפון": "מספר טלפון", "אימייל": "דואר אלקטרוני"}`;

    // קריאה ישירה ל-Groq API
    const GROQ_API_KEY =
      "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";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
          stop: null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // ניקוי מתקדם של התוכן והמרה ל-JSON
    let cleanContent = content.trim();

    // הסר markdown formatting
    if (cleanContent.includes("```json")) {
      const jsonStart = cleanContent.indexOf("```json") + 7;
      const jsonEnd = cleanContent.indexOf("```", jsonStart);
      if (jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd).trim();
      }
    } else if (cleanContent.includes("```")) {
      const jsonStart = cleanContent.indexOf("```") + 3;
      const jsonEnd = cleanContent.lastIndexOf("```");
      if (jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd).trim();
      }
    }

    // חפש את ה-JSON הראשון
    const jsonStart = cleanContent.indexOf("{");
    const jsonEnd = cleanContent.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }

    // הסר תווים לא חוקיים ושורות ריקות
    cleanContent = cleanContent
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\t/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    console.log("תוכן נקי לפרסור:", cleanContent);

    const aiMapping = JSON.parse(cleanContent);
    console.log("AI מיפוי מוצלח:", aiMapping);
    return aiMapping;
  } catch (error) {
    console.warn("מיפוי AI נכשל, עובר למיפוי בסיסי:", error);

    // Fallback ללוגיקה הבסיסית הקיימת
    return performBasicMapping(csvHeaders);
  }
};

// פונקציה למיפוי בסיסי (הלוגיקה המקורית + תיקונים)
const performBasicMapping = (csvHeaders) => {
  const mapping = {};

  csvHeaders.forEach((header) => {
    const h = String(header || "")
      .toLowerCase()
      .trim();
    if (!h) return;

    if (
      h.includes("שם מלא") ||
      h.includes("full name") ||
      (h.includes("שם") && !h.includes("פרטי") && !h.includes("משפחה"))
    ) {
      mapping["שם"] = header;
    } else if (h.includes("שם פרטי") || h.includes("first name")) {
      mapping["שם_פרטי"] = header;
    } else if (
      h.includes("שם משפחה") ||
      h.includes("last name") ||
      h.includes("family name")
    ) {
      mapping["שם_משפחה"] = header;
    } else if (h.includes("כינוי") || h.includes("nickname")) {
      mapping["כינוי"] = header;
    } else if (h.includes("תואר") || h.includes("title")) {
      mapping["תואר"] = header;
    } else if (
      h.includes("דואל") ||
      h.includes("דוא״ל") ||
      h.includes("דואר אלקטרוני") ||
      h.includes("email") ||
      h.includes("מייל") ||
      h.includes('דוא"ל') ||
      h.includes("אימייל") ||
      h.includes("e-mail")
    ) {
      mapping["אימייל"] = header;
    } else if (
      h.includes("טלפון") ||
      h.includes("phone") ||
      h.includes("נייד") ||
      h.includes("mobile") ||
      h.includes("פלאפון")
    ) {
      mapping["טלפון"] = header;
    } else if (h.includes("כתובת מלאה") || h.includes("full address")) {
      mapping["כתובת_מלאה"] = header;
    } else if (h.includes("רחוב") || h.includes("street")) {
      mapping["כתובת_רחוב"] = header;
    } else if (h.includes("עיר") || h.includes("city")) {
      mapping["כתובת_עיר"] = header;
    } else if (h.includes("כתובת") || h.includes("address")) {
      mapping["כתובת_מלאה"] = header;
    }
  });

  console.log("מיפוי בסיסי:", mapping);
  return mapping;
};

function ColumnMappingStep({
  csvData,
  csvHeaders,
  columnMapping,
  setColumnMapping,
  handleConfirmColumnMapping,
  resetStateForNewUpload,
}) {
  const [isAutoMapping, setIsAutoMapping] = useState(false);

  const handleColumnSelectChange = (targetFieldId, csvHeader) => {
    setColumnMapping((prev) => ({
      ...prev,
      [targetFieldId]: csvHeader === "NONE" ? null : csvHeader,
    }));
  };

  const handleAutoMapping = async () => {
    setIsAutoMapping(true);
    try {
      const autoMapping = await performAutoMapping(csvHeaders, csvData);
      setColumnMapping(autoMapping);
    } catch (error) {
      console.error("שגיאה במיפוי אוטומטי:", error);
    } finally {
      setIsAutoMapping(false);
    }
  };

  const isMappingValid = () => {
    const hasFullName = columnMapping["שם"];
    const hasFirstAndLast =
      columnMapping["שם_פרטי"] && columnMapping["שם_משפחה"];
    const hasPhone = columnMapping["טלפון"];

    return hasPhone && (hasFullName || hasFirstAndLast);
  };

  const displayRows = csvData?.slice(0, 15) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4"
    >
      <div className="w-full mx-auto h-full flex flex-col">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <FileText className="w-8 h-8" />
                  שיוך עמודות
                </CardTitle>
                <p className="text-indigo-100 text-lg">
                  התאם בין העמודות בקובץ שלך לשדות במערכת
                </p>
              </div>
              <Button
                onClick={handleAutoMapping}
                disabled={isAutoMapping}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Wand2
                  className={`w-5 h-5 ml-2 ${
                    isAutoMapping ? "animate-spin" : ""
                  }`}
                />
                {isAutoMapping ? "מנתח באמצעות AI..." : "מיפוי אוטומטי"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 flex-1 flex flex-col min-h-0">
            {csvHeaders && csvHeaders.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                <div className="max-h-[60vh] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        {csvHeaders.map((header, index) => (
                          <TableHead
                            key={index}
                            className="text-center p-4 w-auto sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100"
                          >
                            <div className="space-y-3">
                              <div
                                className="font-semibold text-gray-800 text-sm truncate max-w-[150px] mx-auto"
                                title={header}
                              >
                                {header || `עמודה ${index + 1}`}
                              </div>
                              <Select
                                value={
                                  Object.entries(columnMapping).find(
                                    ([, value]) => value === header
                                  )?.[0] || "NONE"
                                }
                                onValueChange={(value) =>
                                  handleColumnSelectChange(value, header)
                                }
                                dir="rtl"
                              >
                                <SelectTrigger className="w-full h-9 text-sm border-2 border-gray-200 rounded-xl hover:border-indigo-400 focus:border-indigo-500 transition-colors">
                                  <SelectValue placeholder="בחר שדה..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  <SelectItem value="NONE">לא ממופה</SelectItem>
                                  {TARGET_FIELDS.map((field) => (
                                    <SelectItem key={field.id} value={field.id}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayRows.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                        >
                          {csvHeaders.map((header, colIndex) => (
                            <TableCell
                              key={colIndex}
                              className="text-center p-3 text-sm text-gray-700 max-w-[150px] truncate"
                              title={row[header]}
                            >
                              {row[header] || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 flex-1 flex flex-col justify-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">לא נמצאו נתונים להצגה</p>
              </div>
            )}
          </CardContent>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-4 order-1 sm:order-1">
                <Button
                  onClick={resetStateForNewUpload}
                  variant="outline"
                  className="border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  בחר קובץ אחר
                </Button>
                <Button
                  onClick={resetStateForNewUpload}
                  variant="outline"
                  className="border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  חזור
                </Button>
              </div>

              <Button
                onClick={handleConfirmColumnMapping}
                disabled={!isMappingValid()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-2"
              >
                <Check className="w-5 h-5 ml-2" />
                התחל עיבוד
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

ColumnMappingStep.propTypes = {
  csvData: PropTypes.array.isRequired,
  csvHeaders: PropTypes.array.isRequired,
  columnMapping: PropTypes.object.isRequired,
  setColumnMapping: PropTypes.func.isRequired,
  handleConfirmColumnMapping: PropTypes.func.isRequired,
  resetStateForNewUpload: PropTypes.func.isRequired,
};

export default ColumnMappingStep;
