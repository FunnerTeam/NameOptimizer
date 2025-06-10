import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Download,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  BarChart3,
  Clock,
  FileText,
  Users,
  Timer,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import PropTypes from "prop-types";

export default function ResultsDisplay({
  processing,
  detailedReportFile,
  onReset,
  onDownloadMain,
  onDownloadDetailed,
}) {
  const downloadMainFile = () => {
    if (onDownloadMain) {
      onDownloadMain();
    } else if (processing && processing.processed_file_url) {
      window.open(processing.processed_file_url, "_blank");
    }
  };

  const downloadDetailedReportFile = () => {
    if (onDownloadDetailed) {
      onDownloadDetailed();
    } else if (detailedReportFile) {
      const url = URL.createObjectURL(detailedReportFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = detailedReportFile.name || "דוח_מפורט.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // חישוב זמן עיבוד
  const calculateProcessingTime = () => {
    if (processing?.start_time && processing?.end_time) {
      const startTime = new Date(processing.start_time);
      const endTime = new Date(processing.end_time);
      const diffMs = endTime - startTime;
      const diffSeconds = Math.round(diffMs / 1000);

      if (diffSeconds < 60) {
        return `${diffSeconds} שניות`;
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        const seconds = diffSeconds % 60;
        return `${minutes} דקות${seconds > 0 ? ` ו-${seconds} שניות` : ""}`;
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        return `${hours} שעות${minutes > 0 ? ` ו-${minutes} דקות` : ""}`;
      }
    }

    // חישוב משוער לפי כמות השורות (2.5 שניות לשורה)
    if (totalInput > 0) {
      const estimatedSeconds = totalInput * 2.5;
      if (estimatedSeconds < 60) {
        return `~${Math.round(estimatedSeconds)} שניות`;
      } else if (estimatedSeconds < 3600) {
        const minutes = Math.floor(estimatedSeconds / 60);
        return `~${minutes} דקות`;
      } else {
        const hours = Math.floor(estimatedSeconds / 3600);
        const minutes = Math.floor((estimatedSeconds % 3600) / 60);
        return `~${hours} שעות${minutes > 0 ? ` ו-${minutes} דקות` : ""}`;
      }
    }

    return "לא זמין";
  };

  // Extract summary data
  const summary = processing?.improvements_summary || {};
  const duplicatesRemoved =
    summary.duplicates_removed || summary["סך כפולים שנוקו"] || 0;
  const totalProcessed = processing?.processed_rows || 0;
  const totalInput = processing?.total_rows || 0;
  const deletedRowsInvalid = totalInput - totalProcessed - duplicatesRemoved; // שורות שנמחקו בגלל שלא תקינות

  // חישוב אחוזים
  const successRate =
    totalInput > 0 ? Math.round((totalProcessed / totalInput) * 100) : 0;
  const processedRate = 100; // תמיד 100% כי עברנו על כל השורות

  // נתוני הפאי
  const pieData = [
    {
      name: "תוקנו בהצלחה",
      value: totalProcessed,
      percentage: successRate,
      color: "#10b981",
    },
    {
      name: "כפולים הוסרו",
      value: duplicatesRemoved,
      percentage:
        totalInput > 0 ? Math.round((duplicatesRemoved / totalInput) * 100) : 0,
      color: "#f59e0b",
    },
    {
      name: "נמחקו (לא תקינות)",
      value: deletedRowsInvalid,
      percentage:
        totalInput > 0
          ? Math.round((deletedRowsInvalid / totalInput) * 100)
          : 0,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0); // מציג רק ערכים שלא אפס

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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center relative border border-white/30"
            >
              <CheckCircle className="w-8 h-8 text-white" />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>

            <CardTitle className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
              <BarChart3 className="w-6 h-6" />
              העיבוד הושלם בהצלחה!
            </CardTitle>
            <p className="text-base text-indigo-100">
              הנתונים שלך מעובדים ומוכנים להורדה
            </p>
            {processing?.original_filename && (
              <p className="text-indigo-200 text-xs mt-1">
                {processing.original_filename}
              </p>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-4 flex-1 overflow-auto">
            {/* KPIs עיקריים */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {totalInput.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  שורות בקובץ המקורי
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {totalProcessed.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  שורות בקובץ המתוקן
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center mb-2">
                  <Timer className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {calculateProcessingTime()}
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  זמן עיבוד
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-700 mb-1">
                  {processedRate}%
                </div>
                <div className="text-xs text-orange-600 font-medium">
                  שורות שעובדו
                </div>
              </div>
            </div>

            {/* גרפים ראשיים - אחד ליד השני */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* גרף 1: אחוז הצלחה */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="text-base text-green-700 font-semibold">
                    אחוז השורות שעובדו בהצלחה
                  </h3>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <svg
                      className="w-32 h-32 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradientSuccess)"
                        strokeWidth="10"
                        strokeDasharray={`${(successRate / 100) * 283} 283`}
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient
                          id="gradientSuccess"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-700">
                        {successRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <p className="text-sm text-green-600">
                    {totalProcessed.toLocaleString()} מתוך{" "}
                    {totalInput.toLocaleString()} שורות
                  </p>
                </div>
              </motion.div>

              {/* גרף 2: פילוח התוצאות */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base text-indigo-700 font-semibold">
                    פילוח תוצאות העיבוד
                  </h3>
                </div>

                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-40 h-40">
                    <PieChart width={160} height={160}>
                      <Pie
                        data={pieData}
                        cx={80}
                        cy={80}
                        labelLine={false}
                        innerRadius={0}
                        outerRadius={65}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs shadow-lg">
                                <span>
                                  {data.name}: {data.value.toLocaleString()} (
                                  {data.percentage}%)
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-gray-700">
                        {totalInput.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* מקרא */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                  {pieData.map((entry, index) => (
                    <div
                      key={`legend-${index}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 bg-gray-200 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="leading-none whitespace-nowrap">
                        {entry.name}: {entry.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* שיפורים מפורטים */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="text-base text-teal-700 font-semibold">
                  שיפורים שבוצעו בנתונים:
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <div className="text-2xl font-bold text-teal-700 mb-1">
                    {(
                      summary.names_fixed ||
                      summary["סך שמות שתוקנו"] ||
                      0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-teal-600">שמות תוקנו</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <div className="text-2xl font-bold text-teal-700 mb-1">
                    {(
                      summary.phones_formatted ||
                      summary["סך טלפונים שעוצבו"] ||
                      0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-teal-600">טלפונים עוצבו</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-teal-100">
                  <div className="text-2xl font-bold text-teal-700 mb-1">
                    {(
                      summary.emails_validated ||
                      summary["סך כתובות אימייל שאומתו"] ||
                      0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-teal-600">מיילים אומתו</div>
                </div>
              </div>
            </motion.div>

            {/* מידע על הקובץ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl"
            >
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium text-base">
                  העיבוד הושלם בהצלחה ב-{new Date().toLocaleDateString("he-IL")}
                </span>
              </div>
            </motion.div>

            {/* כפתורי הורדה בשורה אחת */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              {/* כפתור עיבוד קובץ נוסף - שמאל */}
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-lg py-6 rounded-xl hover-lift order-3 sm:order-1"
              >
                <RefreshCw className="w-5 h-5 ml-2" />
                עיבוד קובץ נוסף
              </Button>

              {/* כפתור דוח מפורט - אמצע */}
              {detailedReportFile && (
                <Button
                  onClick={downloadDetailedReportFile}
                  variant="outline"
                  size="lg"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 text-lg py-6 rounded-xl hover-lift order-2"
                >
                  <FileSpreadsheet className="w-5 h-5 ml-2" />
                  הורד דוח עיבוד מפורט
                </Button>
              )}

              {/* כפתור הורד קובץ משופר - ימין */}
              <Button
                onClick={downloadMainFile}
                size="lg"
                disabled={!onDownloadMain && !processing?.processed_file_url}
                className="flex-1 bg-gradient-to-l from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6 rounded-xl shadow-lg hover-lift order-1 sm:order-3"
              >
                <Download className="w-5 h-5 ml-2" />
                הורד קובץ משופר
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

ResultsDisplay.propTypes = {
  processing: PropTypes.object,
  detailedReportFile: PropTypes.object,
  onReset: PropTypes.func,
  onDownloadMain: PropTypes.func,
  onDownloadDetailed: PropTypes.func,
};
