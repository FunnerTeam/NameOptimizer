import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  Trash2,
  AlertCircle,
  History as HistoryIcon,
  Clock,
  FileText,
  Loader2,
  User,
} from "lucide-react";

// הוק אימות ושירותים
import useAuth from "../hooks/useAuth";
import processingService from "../services/processingService.js";

const HistoryPage = () => {
  // הוק אימות
  const { user, isAuthenticated } = useAuth();

  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingIds, setDeletingIds] = useState(() => new Set());

  // פונקציה עזר לבדיקה בטוחה של deletingIds
  const isDeleting = (recordId) => {
    return deletingIds instanceof Set && deletingIds.has(recordId);
  };

  useEffect(() => {
    // אם המשתמש מחובר, טען היסטוריה
    if (isAuthenticated() && user) {
      loadHistory();
    }
  }, [user, isAuthenticated]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await processingService.getProcessingHistory();

      if (result.success) {
        setHistoryData(result.data || []);
      } else {
        setError(result.error || "שגיאה בטעינת ההיסטוריה");
      }
    } catch (err) {
      console.error("שגיאה בטעינת היסטוריה:", err);
      setError("שגיאה בחיבור לשרת");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!user) return;

    setDeletingIds((prev) => {
      const currentSet = prev instanceof Set ? prev : new Set();
      const newSet = new Set(currentSet);
      newSet.add(recordId);
      return newSet;
    });

    try {
      const result = await processingService.deleteProcessing(recordId);

      if (result.success) {
        // הסר מהרשימה המקומית
        setHistoryData((prev) =>
          prev.filter((record) => record.id !== recordId)
        );
      } else {
        setError(result.error || "שגיאה במחיקת הרשומה");
      }
    } catch (err) {
      setError("שגיאה במחיקת הרשומה");
      console.error("שגיאה במחיקה:", err);
    } finally {
      setDeletingIds((prev) => {
        const currentSet = prev instanceof Set ? prev : new Set();
        const newSet = new Set(currentSet);
        newSet.delete(recordId);
        return newSet;
      });
    }
  };

  const handleDownloadFile = (fileUrl, filename) => {
    processingService.downloadFile(fileUrl, filename);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSummary = (summary) => {
    if (!summary || typeof summary !== "object") return [];

    return Object.entries(summary)
      .filter(([, value]) => typeof value === "number")
      .slice(0, 4); // הצג רק 4 הראשונים
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <HistoryIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              היסטוריית עיבודים
            </h1>
            <p className="text-lg text-slate-600">
              הכנס אימייל כדי לראות את העיבודים הקודמים שלך
            </p>
          </motion.div>

          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">
                  הזן את האימייל שלך
                </h3>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={loadHistory}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      טוען...
                    </>
                  ) : (
                    <>
                      <HistoryIcon className="w-4 h-4 mr-2" />
                      הצג היסטוריה
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
            <HistoryIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            היסטוריית עיבודים
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            {user.email} - {historyData.length} עיבודים
          </p>

          <div className="flex justify-center gap-3">
            <Button
              onClick={loadHistory}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <Loader2
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              רענן
            </Button>
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-slate-600">טוען היסטוריה...</p>
          </div>
        ) : historyData.length === 0 ? (
          <Card className="glass-effect border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                אין עיבודים קודמים
              </h3>
              <p className="text-slate-600 mb-4">
                לא נמצאו עיבודים עבור האימייל הזה
              </p>
              <Button
                onClick={() => (window.location.href = "/upload")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                התחל עיבוד חדש
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {historyData.map((record, index) => {
                const isExpired = processingService.checkFileExpiry(
                  record.expires_at
                );

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`glass-effect border-0 shadow-lg ${
                        isExpired.isExpired ? "opacity-75" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            {record.original_filename}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {!isExpired.isExpired && (
                              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                {isExpired.timeLeftFormatted}
                              </div>
                            )}
                            {isExpired.isExpired && (
                              <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                פג תוקף
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(record.created_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {record.total_rows} שורות
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* סיכום שיפורים */}
                        {record.improvements_summary && (
                          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                            <h4 className="font-medium text-slate-800 mb-2 text-sm">
                              סיכום שיפורים:
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {formatSummary(record.improvements_summary).map(
                                ([key, value]) => (
                                  <div key={key} className="text-center">
                                    <div className="font-bold text-blue-600">
                                      {value}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                      {key}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* כפתורי פעולה */}
                        <div className="flex flex-wrap gap-2">
                          {record.processed_file_url &&
                            !isExpired.isExpired && (
                              <Button
                                onClick={() =>
                                  handleDownloadFile(
                                    record.processed_file_url,
                                    `${record.original_filename}_cleaned.csv`
                                  )
                                }
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                אנשי קשר מנוקים
                              </Button>
                            )}

                          {record.detailed_report_file_url &&
                            !isExpired.isExpired && (
                              <Button
                                onClick={() =>
                                  handleDownloadFile(
                                    record.detailed_report_file_url,
                                    `${record.original_filename}_report.csv`
                                  )
                                }
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                דוח מפורט
                              </Button>
                            )}

                          <Button
                            onClick={() => handleDeleteRecord(record.id)}
                            disabled={isDeleting(record.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            {isDeleting(record.id) ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-1" />
                            )}
                            מחק
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
