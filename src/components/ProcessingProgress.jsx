import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, Sparkles, Settings2, ListChecks, Upload as UploadIcon, AlertCircle } from "lucide-react"; // Added UploadIcon and AlertCircle
import { motion } from "framer-motion";

export default function ProcessingProgress({ processing }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const getProgressPercentage = () => {
    if (!processing || !processing.status) return animatedProgress; // Keep current if no status
    switch (processing.status) {
      case "initial_parsing": return 10; // New step: file is being read and LLM is getting headers/samples
      case "uploading": return 5; // This might be very brief or skipped if initial_parsing is used.
      case "mapping": return 15; // User is in mapping step (though this component might not be shown here)
      case "preview": return 20; // User is in preview step (similarly, might not be shown)
      case "processing":
        if (processing.total_rows && processing.processed_rows !== undefined && processing.total_rows > 0) {
          const base = 25; // After preview/initial steps
          const llmPhase = (processing.processed_rows / processing.total_rows) * 70; // LLM takes most time
          return Math.min(base + llmPhase, 99);
        }
        return 25; // Just started actual "processing" phase (LLM enrichment)
      case "completed": return 100;
      case "error": return animatedProgress; // Keep current progress if error, message will indicate issue
      default: return animatedProgress;
    }
  };

  const getStatusText = () => {
    if (!processing || !processing.status) return "טוען...";
    switch (processing.status) {
      case "initial_parsing": return "קורא ומנתח את מבנה הקובץ...";
      case "uploading": return "מעלה קובץ לשרת...";
      case "mapping": return "ממתין למיפוי עמודות..."; // Unlikely to be shown via this component
      case "preview": return "ממתין לאישור תצוגה מקדימה..."; // Unlikely to be shown
      case "processing": return "מטייב ומעשיר את הנתונים...";
      case "completed": return "העיבוד הושלם!";
      case "error": return "אירעה שגיאה בתהליך";
      default: return "מעבד...";
    }
  };
  
  const getIconForStatus = () => {
    if (!processing || !processing.status) return <Sparkles className="w-10 h-10 text-white" />;
    switch (processing.status) {
      case "initial_parsing": return <FileText className="w-10 h-10 text-white" />;
      case "uploading": return <UploadIcon className="w-10 h-10 text-white" />;
      case "mapping": return <Settings2 className="w-10 h-10 text-white" />;
      case "preview": return <ListChecks className="w-10 h-10 text-white" />;
      case "processing": return <Sparkles className="w-10 h-10 text-white" />;
      case "completed": return <CheckCircle className="w-10 h-10 text-white" />; // Icon for completed state
      case "error": return <AlertCircle className="w-10 h-10 text-white" />; // Icon for error state
      default: return <FileText className="w-10 h-10 text-white" />;
    }
  }

  useEffect(() => {
    const targetProgress = getProgressPercentage();
    // No animation if error or completed, just set final state
    if (processing?.status === 'error' || processing?.status === 'completed') {
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


  if (!processing) return null; // Don't render if no processing object

  const iconBgColor = processing.status === 'error' ? 'from-red-500 to-rose-600' 
                    : processing.status === 'completed' ? 'from-green-500 to-emerald-600'
                    : 'from-blue-500 to-blue-600';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${iconBgColor} rounded-2xl flex items-center justify-center relative`}>
            {getIconForStatus()}
            {(processing.status === 'processing' || processing.status === 'initial_parsing') && (
                <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center"
                >
                <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
            )}
          </div>
          <CardTitle className="text-2xl text-slate-800">{getStatusText()}</CardTitle>
          <p className="text-slate-600">{processing.original_filename}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {processing.status !== 'error' && processing.status !== 'completed' && ( // Don't show progress bar for error/completed
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">התקדמות</span>
                <span className="font-semibold text-slate-800">{animatedProgress.toFixed(0)}%</span>
              </div>
              <Progress value={animatedProgress} className="h-3 bg-slate-200" />
            </div>
          )}

          {processing.status === 'error' && processing.error_message && (
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{processing.error_message}</p>
            </div>
          )}

          {processing.status === 'processing' && processing.total_rows !== undefined && processing.total_rows > 0 && (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{processing.total_rows}</div>
                <div className="text-sm text-blue-600">סה"כ שורות (מוערך)</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{processing.processed_rows || 0}</div>
                <div className="text-sm text-green-600">שורות עובדו</div>
              </div>
            </div>
          )}

          {(processing.status === 'processing' || processing.status === 'initial_parsing' || processing.status === 'uploading') && (
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">התהליך בעיצומו, אנא המתן...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}