import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react"; // Changed FileSpreadsheet to FileText
import { motion } from "framer-motion";

export default function FileUploadZone({ 
  onFileSelect, 
  onDragEvents, 
  onDrop, 
  dragActive, 
  selectedFile, 
  fileInputRef 
}) {
  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv" // Changed to accept only CSV
        onChange={handleFileInput}
        className="hidden"
      />

      {!selectedFile ? (
        <motion.div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? "border-teal-400 bg-teal-50" 
              : "border-slate-300 hover:border-teal-400"
          }`}
          onDragEnter={(e) => onDragEvents(e, true)}
          onDragLeave={(e) => onDragEvents(e, false)}
          onDragOver={(e) => onDragEvents(e, true)}
          onDrop={onDrop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center">
            <Upload className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-3">העלה קובץ <strong className="text-teal-700">CSV</strong></h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            גרור ושחרר את קובץ ה-<strong className="text-teal-700">CSV</strong> שלך כאן, או לחץ כדי לבחור קובץ
          </p>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            className="bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 px-8 py-6 text-lg rounded-xl shadow-lg hover-lift"
          >
            <FileText className="w-5 h-5 ml-2" /> {/* Changed Icon */}
            בחר קובץ
          </Button>
          
          <div className="mt-6 text-sm text-slate-500">
            <p>פורמט נתמך: <strong className="text-teal-700">.csv</strong></p>
            <p>גודל מקסימלי: 10MB</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border-2 border-green-300 bg-green-50 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" /> {/* Changed Icon */}
          </div>
          
          <h3 className="text-xl font-semibold text-green-800 mb-2">קובץ נבחר</h3>
          <p className="text-green-700 mb-4 text-lg font-medium">{selectedFile.name}</p>
          <p className="text-green-600 text-sm mb-6">
            גודל: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          
          <Button
            variant="outline"
            onClick={removeFile}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            <X className="w-4 h-4 ml-1" />
            הסר קובץ
          </Button>
        </motion.div>
      )}
    </div>
  );
}