import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

export default function FileUploadZone({
  onFileSelect,
  onDragEvents,
  onDrop,
  dragActive,
  selectedFile,
  fileInputRef,
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
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
      />

      {!selectedFile ? (
        <motion.div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? "border-indigo-500 bg-indigo-50 scale-105"
              : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
          }`}
          onDragEnter={(e) => onDragEvents(e, true)}
          onDragLeave={(e) => onDragEvents(e, false)}
          onDragOver={(e) => onDragEvents(e, true)}
          onDrop={onDrop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            גרור קובץ CSV לכאן או לחץ לבחירה
          </h3>
          <p className="text-slate-600 mb-6 text-lg">
            קבצי CSV עד 10MB. מומלץ קידוד UTF-8 לתמיכה בעברית.
          </p>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Upload className="w-5 h-5 ml-2" />
            בחר קובץ CSV
          </Button>

          <div className="mt-6 text-sm text-slate-500">
            <p>
              פורמט נתמך: <strong className="text-indigo-600">.csv</strong>
            </p>
            <p>גודל מקסימלי: 10MB</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-green-700 font-semibold text-lg">
              קובץ נבחר: {selectedFile.name}
            </h3>
          </div>

          <p className="text-green-600 text-sm mb-4 text-center">
            גודל: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={removeFile}
              className="border-green-300 text-green-700 hover:bg-green-100 rounded-xl"
            >
              <X className="w-4 h-4 ml-1" />
              הסר קובץ
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

FileUploadZone.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  onDragEvents: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  dragActive: PropTypes.bool.isRequired,
  selectedFile: PropTypes.object,
  fileInputRef: PropTypes.object.isRequired,
};
