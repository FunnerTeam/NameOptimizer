import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckSquare, Clock } from 'lucide-react';
import { motion } from "framer-motion";
import { TARGET_FIELDS } from './ColumnMappingStep'; // Import TARGET_FIELDS

export default function PreviewStep({ fileName, totalRows, sampleRows, columnMapping, onConfirm, onBack }) {
  
  const mappedTargetFields = TARGET_FIELDS.filter(
    tf => columnMapping[tf.id] && columnMapping[tf.id] !== 'NONE'
  );

  const estimateProcessingTime = (rows) => {
    if (!rows || rows === 0) return "לא ידוע";
    const timePerHundredRows = 15; 
    const estimatedSeconds = (rows / 100) * timePerHundredRows;
    if (estimatedSeconds < 60) return `כ-${Math.ceil(estimatedSeconds)} שניות`;
    return `כ-${Math.ceil(estimatedSeconds / 60)} דקות`;
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">תצוגה מקדימה ואישור</CardTitle>
          <p className="text-slate-600">
            אנא בדוק את הנתונים הממופים ואת הערכת זמן העיבוד לפני שתמשיך.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">קובץ: <span className="font-normal">{fileName}</span></h3>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">סה"כ שורות לעיבוד: <span className="font-normal">{totalRows}</span></h3>
          </div>

          {sampleRows && sampleRows.length > 0 && columnMapping && mappedTargetFields.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-slate-700 mb-2">תצוגה מקדימה של 5 שורות ראשונות (לאחר מיפוי):</h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      {mappedTargetFields.map(targetField => (
                        <TableHead key={targetField.id} className="text-slate-700 text-right">{targetField.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRows.slice(0, 5).map((originalRow, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {mappedTargetFields.map(targetField => (
                          <TableCell key={targetField.id} className="text-right">
                            {originalRow[columnMapping[targetField.id]] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-semibold">הערכת זמן עיבוד:</span>
            </div>
            <p className="text-xl font-bold text-blue-800">{estimateProcessingTime(totalRows)}</p>
            <p className="text-xs text-blue-600">(הערכה זו עשויה להשתנות בהתאם למורכבות הנתונים)</p>
          </div>


          <div className="flex justify-between items-center pt-6">
            <Button variant="outline" onClick={onBack} className="hover-lift">
              <ArrowLeft className="w-4 h-4 ml-2" />
              חזור למיפוי עמודות
            </Button>
            <Button 
                onClick={onConfirm}
                className="bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 hover-lift"
            >
              <CheckSquare className="w-4 h-4 ml-2" />
              אשר והתחל עיבוד
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}