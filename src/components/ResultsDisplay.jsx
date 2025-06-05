import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, RefreshCw, Sparkles, FileSpreadsheet } from "lucide-react"; // Added FileSpreadsheet
import { motion } from "framer-motion";

export default function ResultsDisplay({ processing, detailedReportFile, onReset }) {
  const downloadMainFile = () => {
    if (processing && processing.processed_file_url) {
      window.open(processing.processed_file_url, '_blank');
    }
  };

  const downloadDetailedReportFile = () => {
    if (detailedReportFile) {
      const url = URL.createObjectURL(detailedReportFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = detailedReportFile.name || "דוח_מפורט.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };


  // Ensure improvements_summary exists and has values, otherwise default to 0
  const summary = processing?.improvements_summary || {};
  const namesFixed = summary.names_fixed || summary["סך שמות שתוקנו"] || 0;
  const phonesFormatted = summary.phones_formatted || summary["סך טלפונים שעוצבו"] || 0;
  const emailsValidated = summary.emails_validated || summary["סך כתובות אימייל שאומתו"] || 0;
  const addressesEnriched = summary.addresses_enriched || summary["סך כתובות שעושרו"] || 0;


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center relative"
          >
            <CheckCircle className="w-10 h-10 text-white" />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
              className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3 text-white" />
            </motion.div>
          </motion.div>
          
          <CardTitle className="text-2xl text-slate-800 mb-2">העיבוד הושלם בהצלחה!</CardTitle>
          <p className="text-slate-600">{processing?.original_filename}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          { (namesFixed > 0 || phonesFormatted > 0 || emailsValidated > 0 || addressesEnriched > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-l from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
            >
              <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                סיכום שיפורים:
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {namesFixed}
                  </div>
                  <div className="text-sm text-green-600">שמות תוקנו</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {phonesFormatted}
                  </div>
                  <div className="text-sm text-green-600">טלפונים עוצבו</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {emailsValidated}
                  </div>
                  <div className="text-sm text-green-600">מיילים תוקנו</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {addressesEnriched}
                  </div>
                  <div className="text-sm text-green-600">כתובות עושרו</div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 rounded-xl p-6 border border-blue-200"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">{processing?.processed_rows || 0}</div>
              <div className="text-blue-600">שורות עובדו בהצלחה</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-4 pt-4"
          >
            <Button
              onClick={downloadMainFile}
              size="lg"
              disabled={!processing?.processed_file_url}
              className="w-full bg-gradient-to-l from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6 rounded-xl shadow-lg hover-lift"
            >
              <Download className="w-5 h-5 ml-2" />
              הורד קובץ משופר
            </Button>
            
            {detailedReportFile && (
              <Button
                onClick={downloadDetailedReportFile}
                variant="outline"
                size="lg"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-lg py-6 rounded-xl hover-lift"
              >
                <FileSpreadsheet className="w-5 h-5 ml-2" />
                הורד דוח עיבוד מפורט
              </Button>
            )}
            
            <Button
              onClick={onReset}
              variant="outline"
              size="lg"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 text-lg py-6 rounded-xl hover-lift"
            >
              <RefreshCw className="w-5 h-5 ml-2" />
              עיבוד קובץ נוסף
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}