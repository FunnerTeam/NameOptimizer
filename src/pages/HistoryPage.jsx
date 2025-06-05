
import React, { useState, useEffect, useCallback } from "react";
import { ContactProcessing } from "@/api/entities";
import { User } from "@/api/entities"; // Import User entity
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Clock, CheckCircle, XCircle, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { format, differenceInSeconds, addHours } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";


const CountdownTimer = ({ expiryTimestamp, isDeleted, deletionMethod }) => {
  const calculateTimeLeft = useCallback(() => {
    if (isDeleted) {
      if (deletionMethod === 'user') return { text: "נמחק על ידך", expired: true, color: "text-red-600" };
      if (deletionMethod === 'auto') return { text: "נמחק (פג תוקף)", expired: true, color: "text-red-600" };
      return { text: "נמחק", expired: true, color: "text-red-600" };
    }

    const now = new Date();
    const expiry = new Date(expiryTimestamp);
    const diffSeconds = differenceInSeconds(expiry, now);

    if (diffSeconds <= 0) {
      return { text: "פג תוקף", expired: true, color: "text-orange-600" };
    }

    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    
    return { 
      text: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, 
      expired: false,
      color: hours < 1 ? "text-yellow-600" : "text-green-600"
    };
  }, [expiryTimestamp, isDeleted, deletionMethod]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (timeLeft.expired) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, timeLeft.expired]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 text-sm font-medium ${timeLeft.color}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft.text}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-right bg-slate-700 text-white p-2 rounded shadow-lg">
          {isDeleted ? (
            <p>{timeLeft.text}</p>
          ) : timeLeft.expired ? (
            <p>תוקף הקובץ פג. הוא אינו זמין להורדה.</p>
          ) : (
            <p>הקובץ זמין להורדה למשך 24 שעות ממועד העיבוד. לאחר מכן יימחק.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


export default function HistoryPage() {
  const [processingHistory, setProcessingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching current user:", error);
        toast.error("שגיאה בזיהוי המשתמש. לא ניתן לטעון היסטוריה.");
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const loadHistory = useCallback(async () => {
    if (!currentUser) { // Don't load history if user is not identified
        setIsLoading(false); // Or keep it true until user is fetched
        return;
    }
    setIsLoading(true);
    try {
      // Filter history by the current user's email (stored in created_by)
      let history = await ContactProcessing.filter({ created_by: currentUser.email }, "-created_date", 50);
      
      const now = new Date();
      const updatesToPerform = [];

      for (const item of history) {
        if (!item.is_deleted && item.expires_at && new Date(item.expires_at) < now) {
          updatesToPerform.push(
            ContactProcessing.update(item.id, {
              is_deleted: true,
              deletion_method: "auto",
              deleted_at: new Date().toISOString(),
            }).then(updatedItem => ({...item, ...updatedItem}))
             .catch(err => {
                console.warn(`Failed to mark item ${item.id} as auto-deleted:`, err);
                return item;
             })
          );
        }
      }
      
      if (updatesToPerform.length > 0) {
          await Promise.all(updatesToPerform);
          // Re-fetch history for consistency after updates
          history = await ContactProcessing.filter({ created_by: currentUser.email }, "-created_date", 50);
      }

      setProcessingHistory(history);
    } catch (error) {
      console.error("שגיאה בטעינת היסטוריה:", error);
      toast.error("שגיאה בטעינת היסטוריית העיבודים.");
    }
    setIsLoading(false);
  }, [currentUser]); // Add currentUser as a dependency


  useEffect(() => {
    if(currentUser) { // Load history only after user is fetched
        loadHistory();
    }
  }, [currentUser, loadHistory]); // Include loadHistory in dependencies

  const handleDeleteFile = async (itemId) => {
    try {
      await ContactProcessing.update(itemId, {
        is_deleted: true,
        deletion_method: "user",
        deleted_at: new Date().toISOString(),
      });
      toast.success("הקובץ נמחק בהצלחה מההיסטוריה (הקישור להורדה הוסר).");
      loadHistory(); 
    } catch (error) {
      console.error("שגיאה במחיקת קובץ:", error);
      toast.error("שגיאה במחיקת הקובץ.");
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "processing":
      case "initial_parsing": // Consider this as a processing state visually
      case "uploading":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />; // For mapping, preview
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "הושלם";
      case "error":
        return "שגיאה";
      case "processing":
        return "מעבד";
      case "initial_parsing":
        return "מנתח קובץ";
      case "uploading":
        return "מעלה";
      case "mapping":
        return "במיפוי";
      case "preview":
        return "בתצוגה מקדימה";
      default:
        return "לא ידוע";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
      case "initial_parsing":
      case "uploading":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default: // For mapping, preview, or unknown
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-800 mb-2">היסטוריית עיבודים</h1>
            <p className="text-slate-600">טוען היסטוריה...</p>
          </motion.div>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-white/60 rounded-xl shadow-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentUser && !isLoading) {
     return (
        <div className="min-h-screen p-6" dir="rtl">
            <div className="max-w-6xl mx-auto text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-700">נדרשת התחברות</h1>
                <p className="text-slate-600">עליך להתחבר כדי לצפות בהיסטוריית העיבודים שלך.</p>
                {/* אפשר להוסיף כאן כפתור התחברות אם רוצים */}
            </div>
        </div>
        );
  }

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2">היסטוריית עיבודים</h1>
          <p className="text-slate-600">הקבצים שעיבדת. קבצים זמינים להורדה למשך 24 שעות בלבד.</p>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence>
            {processingHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="glass-effect border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">אין עדיין היסטוריה</h3>
                    <p className="text-slate-500">לאחר שתעבד קבצים, הם יופיעו כאן</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              processingHistory.map((item, index) => {
                const isDownloadable = item.status === "completed" && item.processed_file_url && !item.is_deleted && item.expires_at && new Date(item.expires_at) > new Date();
                const isDeletableByUser = !item.is_deleted && item.expires_at && new Date(item.expires_at) > new Date();

                return (
                <motion.div
                  key={item.id}
                  layout // Animate layout changes
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Card className="glass-effect border-0 shadow-lg hover-lift overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-grow">
                          <div className={`w-12 h-12 ${isDownloadable ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-slate-300'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-grow min-w-0"> {/* Ensure text truncation works */}
                            <h3 className="font-semibold text-slate-800 truncate" title={item.original_filename}>{item.original_filename}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                              <span>
                                {format(new Date(item.created_date), "dd/MM/yyyy HH:mm", { locale: he })}
                              </span>
                              {item.total_rows !== undefined && (
                                <span>{item.total_rows} שורות</span>
                              )}
                               {item.expires_at && (
                                <CountdownTimer 
                                    expiryTimestamp={item.expires_at} 
                                    isDeleted={item.is_deleted} 
                                    deletionMethod={item.deletion_method} 
                                />
                               )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-end">
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(item.status)} border flex items-center gap-1`}
                          >
                            {getStatusIcon(item.status)}
                            {getStatusText(item.status)}
                          </Badge>

                          {isDownloadable && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-green-50 hover:border-green-200"
                                    onClick={() => window.open(item.processed_file_url, '_blank')}
                                  >
                                    <Download className="w-4 h-4 sm:mr-1" />
                                    <span className="hidden sm:inline">הורד</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-right bg-slate-700 text-white p-2 rounded shadow-lg">
                                  <p>הורד את הקובץ המעובד</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {isDeletableByUser && (
                            <AlertDialog>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                      >
                                        <Trash2 className="w-4 h-4 sm:mr-1" />
                                        <span className="hidden sm:inline">מחק</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-right bg-slate-700 text-white p-2 rounded shadow-lg">
                                    <p>מחק קובץ זה לצמיתות מההיסטוריה (הקישור להורדה יוסר).</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-right">אישור מחיקת קובץ</AlertDialogTitle>
                                  <AlertDialogDescription className="text-right">
                                    האם אתה בטוח שברצונך למחוק את הקובץ "{item.original_filename}"?
                                    פעולה זו תסיר את האפשרות להוריד את הקובץ המעובד. הרשומה תישאר בהיסטוריה עם ציון שהקובץ נמחק.
                                    לא ניתן לשחזר פעולה זו.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-row-reverse">
                                  <AlertDialogAction
                                    onClick={() => handleDeleteFile(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    כן, מחק את הקובץ
                                  </AlertDialogAction>
                                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          {item.is_deleted && item.deletion_method === 'user' && (
                             <span className="text-xs text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3"/> נמחק על ידך</span>
                          )}
                          {item.is_deleted && item.deletion_method === 'auto' && (
                             <span className="text-xs text-orange-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> נמחק (פג תוקף)</span>
                          )}


                        </div>
                      </div>

                      {item.status === "completed" && item.improvements_summary && !item.is_deleted && ( // Show summary only if completed and not deleted
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">סיכום שיפורים:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-green-700">{item.improvements_summary.names_fixed || 0}</div>
                              <div className="text-green-600">שמות תוקנו</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-green-700">{item.improvements_summary.phones_formatted || 0}</div>
                              <div className="text-green-600">טלפונים עוצבו</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-green-700">{item.improvements_summary.emails_validated || 0}</div>
                              <div className="text-green-600">מיילים אומתו</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-green-700">{item.improvements_summary.addresses_enriched || 0}</div>
                              <div className="text-green-600">כתובות עושרו</div>
                            </div>
                             <div className="text-center">
                              <div className="font-semibold text-green-700">{item.improvements_summary.genders_assigned || 0}</div>
                              <div className="text-green-600">מגדרים שויכו</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.error_message && (
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-800 mb-1">שגיאה:</h4>
                          <p className="text-sm text-red-700">{item.error_message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
                );
            })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
