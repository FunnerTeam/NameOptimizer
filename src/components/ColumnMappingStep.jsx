import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ArrowRight, Info, Check } from 'lucide-react';
import { motion } from "framer-motion";

// שדות היעד שאנו רוצים למפות אליהם
export const TARGET_FIELDS = [
  { id: 'fullName', label: 'שם מלא', description: 'עמודה המכילה שם פרטי ושם משפחה יחד (לדוגמה: "ישראל ישראלי").' },
  { id: 'firstName', label: 'שם פרטי', description: 'עמודה המכילה רק שם פרטי (לדוגמה: "משה").' },
  { id: 'lastName', label: 'שם משפחה', description: 'עמודה המכילה רק שם משפחה (לדוגמה: "כהן").' },
  { id: 'phone', label: 'טלפון', description: 'עמודה המכילה מספר טלפון (לדוגמה: "050-1234567").' },
  { id: 'email', label: 'דוא"ל', description: 'עמודה המכילה כתובת דואר אלקטרוני (לדוגמה: "user@example.com").' },
  { id: 'address', label: 'כתובת', description: 'עמודה המכילה כתובת מלאה (לדוגמה: "רחוב הרצל 1, תל אביב").' },
  // ניתן להוסיף עוד שדות יעד לפי הצורך
];

// ניסיון לזיהוי אוטומטי פשוט
const tryAutoMap = (header, headers) => {
  const h = String(header || '').toLowerCase().trim(); // Ensure header is a string and trim
  if (!h) return null;

  if (h.includes('שם מלא') || h.includes('full name') || (h.includes('שם') && !h.includes('פרטי') && !h.includes('משפחה'))) return 'fullName';
  if (h.includes('שם פרטי') || h.includes('first name')) return 'firstName';
  if (h.includes('שם משפחה') || h.includes('last name') || h.includes('family name')) return 'lastName';
  if (h.includes('טלפון') || h.includes('phone') || h.includes('נייד') || h.includes('mobile')) return 'phone';
  if (h.includes('דואל') || h.includes('דואר אלקטרוני') || h.includes('email') || h.includes('מייל')) return 'email';
  if (h.includes('כתובת') || h.includes('address')) return 'address';
  
  // Check for direct match if no keywords found
  const directMatch = TARGET_FIELDS.find(tf => h === tf.label.toLowerCase());
  if (directMatch) return directMatch.id;

  return null;
};

export default function ColumnMappingStep({ csvHeaders, sampleRows, initialMapping, onMappingConfirmed, onBack }) {
  const [mapping, setMapping] = useState({});
  const [showDescriptions, setShowDescriptions] = useState({});

  useEffect(() => {
    const newInitialMapping = {};
    if (initialMapping && Object.keys(initialMapping).length > 0) {
        TARGET_FIELDS.forEach(targetField => {
            newInitialMapping[targetField.id] = initialMapping[targetField.id] || 'NONE';
        });
    } else if (csvHeaders && csvHeaders.length > 0) {
        const autoMapping = {};
        csvHeaders.forEach(header => {
          const targetFieldId = tryAutoMap(header, csvHeaders);
          if (targetFieldId && (!autoMapping[targetFieldId] || autoMapping[targetFieldId] === 'NONE')) {
            autoMapping[targetFieldId] = header;
          }
        });
        TARGET_FIELDS.forEach(targetField => {
            newInitialMapping[targetField.id] = autoMapping[targetField.id] || 'NONE';
        });
    } else {
         TARGET_FIELDS.forEach(targetField => {
            newInitialMapping[targetField.id] = 'NONE';
        });
    }
    setMapping(newInitialMapping);
  }, [csvHeaders, initialMapping]);

  const handleSelectChange = (targetFieldId, csvHeaderValue) => {
    setMapping(prev => ({ ...prev, [targetFieldId]: csvHeaderValue }));
  };

  const toggleDescription = (fieldId) => {
    setShowDescriptions(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };
  
  const isMappingValid = () => {
    return Object.values(mapping).some(value => value && value !== 'NONE');
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <Card className="glass-effect border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">מיפוי עמודות</CardTitle>
          <p className="text-slate-600">
            התאם בין שדות היעד בעמודה הימנית לבין העמודות המתאימות מקובץ ה-CSV שהעלית (בעמודה השמאלית).
            המערכת ניסתה לבצע זיהוי אוטומטי, אך אנא ודא את נכונותו.
            בחר "לא רלוונטי" אם שדה מסוים אינו קיים או אינך רוצה לטייב אותו.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-8">
            {TARGET_FIELDS.map(targetField => (
              <div key={targetField.id} className="pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <label htmlFor={targetField.id} className="font-semibold text-lg text-teal-700">
                        {targetField.label}
                        </label>
                        <Button variant="ghost" size="icon" onClick={() => toggleDescription(targetField.id)} className="text-slate-400 hover:text-slate-600 h-7 w-7">
                            <Info className="w-4 h-4" />
                        </Button>
                    </div>
                    {showDescriptions[targetField.id] && (
                      <p className="text-sm text-slate-500 bg-slate-50 p-2 rounded-md">{targetField.description}</p>
                    )}
                  </div>
                  <div className="w-full sm:w-64">
                    <Select
                      value={mapping[targetField.id] || 'NONE'}
                      onValueChange={(value) => handleSelectChange(targetField.id, value)}
                      dir="rtl"
                    >
                      <SelectTrigger id={targetField.id} className="w-full">
                        <SelectValue placeholder="בחר עמודה מהקובץ..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">לא רלוונטי / התעלם משדה זה</SelectItem>
                        {csvHeaders && csvHeaders.length > 0 ? (
                          csvHeaders.map((header, index) => (
                            <SelectItem key={`${header}-${index}`} value={header}>
                              {header || `עמודה ${index + 1} (ללא כותרת)`}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="NO_HEADERS" disabled>אין כותרות זמינות מהקובץ</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sampleRows && sampleRows.length > 0 && Object.values(mapping).some(v => v && v !== 'NONE') && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-3">תצוגה מקדימה של המיפוי (עד 5 שורות ראשונות):</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      {TARGET_FIELDS.filter(tf => mapping[tf.id] && mapping[tf.id] !== 'NONE').map(targetField => (
                        <TableHead key={targetField.id} className="text-slate-700 p-3 text-right">{targetField.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRows.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-slate-50">
                        {TARGET_FIELDS.filter(tf => mapping[tf.id] && mapping[tf.id] !== 'NONE').map(targetField => (
                          <TableCell key={targetField.id} className="p-3 text-right">{row[mapping[targetField.id]] || '-'}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 gap-4">
            <Button variant="outline" onClick={onBack} className="hover-lift w-full sm:w-auto">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזור להעלאת קובץ
            </Button>
            <Button 
                onClick={() => onMappingConfirmed(mapping)} 
                disabled={!isMappingValid()}
                className="bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 hover-lift w-full sm:w-auto text-base px-6 py-3"
            >
              <Check className="w-5 h-5 ml-2" />
              אשר מיפוי והמשך לתצוגה מקדימה
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}