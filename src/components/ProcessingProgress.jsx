import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  FileText,
  Sparkles,
  Settings2,
  ListChecks,
  Upload as UploadIcon,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Users,
  UserCheck,
  Timer,
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function ProcessingProgress({ processing }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const getProgressPercentage = () => {
    if (!processing || !processing.status) return animatedProgress;
    switch (processing.status) {
      case "initial_parsing":
        return 10;
      case "uploading":
        return 5;
      case "mapping":
        return 15;
      case "preview":
        return 20;
      case "processing":
        if (
          processing.total_rows &&
          processing.processed_rows !== undefined &&
          processing.total_rows > 0
        ) {
          const base = 25;
          const llmPhase =
            (processing.processed_rows / processing.total_rows) * 70;
          return Math.min(base + llmPhase, 99);
        }
        return 25;
      case "completed":
        return 100;
      case "error":
        return animatedProgress;
      default:
        return animatedProgress;
    }
  };

  const getStatusText = () => {
    if (!processing || !processing.status) return "טוען...";
    switch (processing.status) {
      case "initial_parsing":
        return "קורא ומנתח את מבנה הקובץ...";
      case "uploading":
        return "מעלה קובץ לשרת...";
      case "mapping":
        return "ממתין למיפוי עמודות...";
      case "preview":
        return "ממתין לאישור תצוגה מקדימה...";
      case "processing":
        return "מטייב ומעשיר את הנתונים באמצעות AI...";
      case "completed":
        return "העיבוד הושלם בהצלחה!";
      case "error":
        return "אירעה שגיאה בתהליך";
      default:
        return "מעבד...";
    }
  };

  const getIconForStatus = () => {
    if (!processing || !processing.status)
      return <Sparkles className="w-8 h-8 text-white" />;
    switch (processing.status) {
      case "initial_parsing":
        return <FileText className="w-8 h-8 text-white" />;
      case "uploading":
        return <UploadIcon className="w-8 h-8 text-white" />;
      case "mapping":
        return <Settings2 className="w-8 h-8 text-white" />;
      case "preview":
        return <ListChecks className="w-8 h-8 text-white" />;
      case "processing":
        return <Sparkles className="w-8 h-8 text-white" />;
      case "completed":
        return <CheckCircle className="w-8 h-8 text-white" />;
      case "error":
        return <AlertCircle className="w-8 h-8 text-white" />;
      default:
        return <FileText className="w-8 h-8 text-white" />;
    }
  };

  // חישוב הערכת זמן לסיום
  const getEstimatedTimeToCompletion = () => {
    if (
      !processing ||
      processing.status !== "processing" ||
      !processing.total_rows ||
      !processing.processed_rows
    ) {
      return "חישוב...";
    }

    const processedRows = processing.processed_rows || 0;
    const totalRows = processing.total_rows;
    const remainingRows = totalRows - processedRows;

    if (remainingRows <= 0 || processedRows === 0) {
      return "כמעט סיימנו!";
    }

    // הערכה של כ-2-3 שניות לשורה
    const avgTimePerRow = 2.5;
    const estimatedSeconds = remainingRows * avgTimePerRow;

    if (estimatedSeconds < 60) {
      return `${Math.ceil(estimatedSeconds)} שניות`;
    } else if (estimatedSeconds < 3600) {
      return `${Math.ceil(estimatedSeconds / 60)} דקות`;
    } else {
      return `${Math.ceil(estimatedSeconds / 3600)} שעות`;
    }
  };

  useEffect(() => {
    const targetProgress = getProgressPercentage();
    if (processing?.status === "error" || processing?.status === "completed") {
      setAnimatedProgress(targetProgress);
      return;
    }

    let currentProgress = animatedProgress;
    const step = () => {
      if (currentProgress < targetProgress) {
        currentProgress = Math.min(currentProgress + 1, targetProgress);
      } else if (currentProgress > targetProgress) {
        currentProgress = Math.max(currentProgress - 1, targetProgress);
      }
      setAnimatedProgress(currentProgress);
      if (currentProgress !== targetProgress) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [processing?.status, processing?.processed_rows, processing?.total_rows]);

  if (!processing) return null;

  const processedRows = processing.processed_rows || 0;
  const totalRows = processing.total_rows || 0;
  const remainingRows = Math.max(totalRows - processedRows, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4"
    >
      <div className="w-full mx-auto h-full flex flex-col">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-full">
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 text-center flex-shrink-0">
            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center relative border border-white/30">
              {getIconForStatus()}
              {(processing.status === "processing" ||
                processing.status === "initial_parsing") && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
              <BarChart3 className="w-6 h-6" />
              עיבוד נתונים
            </CardTitle>
            <p className="text-base text-indigo-100">{getStatusText()}</p>
            {processing.original_filename && (
              <p className="text-indigo-200 text-xs mt-1">
                {processing.original_filename}
              </p>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-4 flex-1 overflow-auto">
            {processing.status !== "error" &&
              processing.status !== "completed" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      התקדמות כללית
                    </span>
                    <span className="font-bold text-indigo-600 text-lg">
                      {animatedProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={animatedProgress}
                      className="h-3 bg-gray-200 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:via-purple-500 [&>div]:to-indigo-500"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  </div>
                </div>
              )}

            {processing.status === "error" && processing.error_message && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">שגיאה בעיבוד</h4>
                  <p className="text-sm">{processing.error_message}</p>
                </div>
              </div>
            )}

            {processing.status === "processing" && totalRows > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-center mb-2">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-1">
                    {processedRows.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    רשומות עובדו
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {remainingRows.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    רשומות נותרו
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700 mb-1">
                    {getEstimatedTimeToCompletion()}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    זמן משוער לסיום
                  </div>
                </div>
              </div>
            )}

            {processing.status === "completed" && (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  העיבוד הושלם בהצלחה!
                </h3>
                <p className="text-green-600 text-base">
                  הנתונים שלך מוכנים להורדה
                </p>
              </div>
            )}

            {(processing.status === "processing" ||
              processing.status === "initial_parsing" ||
              processing.status === "uploading") && (
              <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-gray-700 font-medium text-base">
                  התהליך בעיצומו, אנא המתן...
                </span>
              </div>
            )}

            {processing.current_step && processing.status === "processing" && (
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs text-indigo-600 font-medium">
                    מעבד כעת:
                  </p>
                </div>
                <p className="font-semibold text-indigo-800 text-base">
                  {processing.current_step}
                </p>
              </div>
            )}

            {processing.user_settings && processing.status === "processing" && (
              <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <Settings2 className="w-5 h-5 text-teal-600" />
                  <p className="text-base text-teal-700 font-semibold">
                    הגדרות עיבוד פעילות:
                  </p>
                </div>
                <div className="text-xs text-teal-600 space-y-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      טיפול בתארים:{" "}
                      {processing.user_settings.name_title_handling === "remove"
                        ? "הסר תארים"
                        : processing.user_settings.name_title_handling ===
                          "prefix_firstname"
                        ? "הוסף לשם פרטי"
                        : "העבר לשדה נפרד"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      פורמט טלפון:{" "}
                      {processing.user_settings.phone_format_preference ===
                      "with_hyphen"
                        ? "עם מקף"
                        : "רק ספרות"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      שיוך מגדר:{" "}
                      {processing.user_settings.gender_assignment
                        ? "מופעל"
                        : "כבוי"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>
                      Truecaller:{" "}
                      {processing.user_settings.truecaller_usage === "never"
                        ? "כבוי"
                        : processing.user_settings.truecaller_usage ===
                          "if_name_missing"
                        ? "רק כשחסר שם"
                        : "תמיד העשר"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

ProcessingProgress.propTypes = {
  processing: PropTypes.shape({
    status: PropTypes.string,
    total_rows: PropTypes.number,
    processed_rows: PropTypes.number,
    original_filename: PropTypes.string,
    error_message: PropTypes.string,
    current_step: PropTypes.string,
    user_settings: PropTypes.object,
  }),
};
