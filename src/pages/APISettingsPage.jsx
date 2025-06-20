import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Copy, ShieldCheck, PlusCircle, KeyRound } from 'lucide-react';
import { User } from '@/api/entities';
import { motion } from 'framer-motion';

export default function APISettingsPage() {
  const [apiToken, setApiToken] = useState(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser && currentUser.api_token) {
            setApiToken(currentUser.api_token);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleGenerateToken = async () => {
    setIsLoadingToken(true);
    const dummyToken = `shamtov_token_${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
    try {
        await User.updateMyUserData({ api_token: dummyToken });
        setApiToken(dummyToken);
        // Simple alert instead of toast for now
        alert("טוקן API (דמה) נוצר בהצלחה!");
    } catch (error) {
        console.error("Error saving dummy token:", error);
        alert("שגיאה ביצירת טוקן דמה.");
    } finally {
        setIsLoadingToken(false);
    }
  };
  
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} הועתק ללוח!`);
    }).catch(err => {
      alert(`שגיאה בהעתקה: ${err}`);
    });
  };

  const requestBodyExample = `{
  "contacts": [
    {
      "name": "ישראל ישראלי",
      "phone": "0501234567",
      "email": "israel@example.com",
      "address": "הרצל 1, תל אביב"
    },
    {
      "name": "שרה לוי",
      "phone": "052-9876543",
      "email": "sara@levi.co.il",
      "address": "הנשיא 5, חיפה"
    }
    // ... ניתן לשלוח עד 10 רשומות
  ]
}`;

  const responseBodyExample = `{
  "processed_contacts": [
    {
      "שם מקורי מהקלט": "ישראל ישראלי",
      "טלפון מקורי מהקלט": "0501234567",
      "דוא\"ל מקורי מהקלט": "israel@example.com",
      "כתובת מקורית מהקלט": "הרצל 1, תל אביב",
      "שם פרטי משופר": "ישראל",
      "שם משפחה משופר": "ישראלי",
      "שם מלא משופר": "ישראל ישראלי",
      "תואר שזוהה": null,
      "שפת השם": "עברית",
      "רמת ודאות פיצול שם": "גבוהה",
      "טלפון מתוקן": "050-1234567",
      "סוג טלפון": "נייד",
      "מקור טלפון": "ישראלי",
      "דוא\"ל מתוקן": "israel@example.com",
      "כתובת משופרת": "הרצל 1, תל אביב"
    }
  ],
  "processing_summary": {
    "סך רשומות שנקלטו": 2,
    "סך רשומות שעובדו בהצלחה": 2,
    "סך שמות שתוקנו": 2,
    "סך טלפונים שעוצבו": 2,
    "סך כתובות אימייל שאומתו": 2,
    "סך כתובות שעושרו": 1
  }
}`;

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">הגדרות API וטוקנים</h1>
          </div>
          <p className="text-lg text-slate-600">
            כאן תוכל למצוא את טוקן ה-API שלך (אם נוצר) ולהבין כיצד להשתמש ב-API של שמטוב לעיבוד נתונים פרוגרמטי.
          </p>
        </motion.div>

        <Card className="mb-8 glass-effect border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
              טוקן API אישי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiToken ? (
              <div>
                <p className="text-slate-600 mb-2">טוקן ה-API הנוכחי שלך הוא:</p>
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
                  <code className="flex-grow text-sm text-indigo-700 break-all">{apiToken}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiToken, 'טוקן API')}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">שמור טוקן זה בסוד. הוא מאפשר גישה לפעולות עיבוד הנתונים בחשבונך.</p>
              </div>
            ) : (
              <p className="text-slate-600">עדיין לא יצרת טוקן API.</p>
            )}
            <Button 
                onClick={handleGenerateToken} 
                disabled={isLoadingToken}
                className="bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
            >
              <PlusCircle className="w-5 h-5 ml-2" />
              {isLoadingToken ? 'יוצר טוקן (דמה)...' : (apiToken ? 'צור טוקן חדש (דמה - יחליף ישן)' : 'צור טוקן API (דמה)')}
            </Button>
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md border border-orange-200">
              <span className="font-bold">הערה חשובה:</span> כרגע, יצירת טוקנים מאובטחים וניהולם אינה ממומשת במלואה. 
              הכפתור למעלה יוצר טוקן <span className="font-semibold">דמה</span> לצורכי הדגמה בלבד והוא <span className="font-bold text-red-600">אינו מאובטח לשימוש בסביבת ייצור</span>. 
              בסביבת ייצור, יש להשתמש במנגנון טוקנים מאובטח שמסופק על ידי הפלטפורמה או מפותח ב-backend.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <Code className="w-7 h-7 text-teal-600" />
              תיעוד API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">נקודת קצה (Endpoint)</h3>
              <div className="p-3 bg-slate-800 rounded-lg text-sm">
                <code className="text-emerald-400">POST /api/process-contacts</code>
              </div>
              <p className="text-sm text-slate-500 mt-1">הכתובת המלאה תהיה תלויה בדומיין של האפליקציה שלך.</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">אימות (Authentication)</h3>
              <p className="text-slate-600 mb-1">יש לשלוח את טוקן ה-API בכותרת <code className="text-indigo-600 bg-indigo-50 px-1 rounded">Authorization</code>:</p>
              <div className="p-3 bg-slate-800 rounded-lg text-sm">
                <code className="text-slate-300">Authorization: Bearer </code><code className="text-amber-400">YOUR_API_TOKEN</code>
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">גוף הבקשה (Request Body)</h3>
              <p className="text-slate-600 mb-1">יש לשלוח JSON עם המבנה הבא. ניתן לשלוח בין 1 ל-10 אנשי קשר במערך <code className="text-indigo-600 bg-indigo-50 px-1 rounded">contacts</code>.</p>
              <div className="relative">
                <pre className="bg-slate-800 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                  <code>{requestBodyExample}</code>
                </pre>
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-slate-400 hover:text-slate-200" onClick={() => copyToClipboard(requestBodyExample, 'גוף הבקשה')}>
                    <Copy className="w-4 h-4" />
                </Button>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">גוף התשובה (Response Body) - הצלחה (200 OK)</h3>
              <p className="text-slate-600 mb-1">במקרה של הצלחה, התשובה תהיה בפורמט JSON עם השדות הבאים:</p>
              <div className="relative">
                 <pre className="bg-slate-800 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                  <code>{responseBodyExample}</code>
                </pre>
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-slate-400 hover:text-slate-200" onClick={() => copyToClipboard(responseBodyExample, 'גוף התשובה')}>
                    <Copy className="w-4 h-4" />
                </Button>
              </div>
              <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1 text-sm">
                <li><code className="text-indigo-600 bg-indigo-50 px-1 rounded">processed_contacts</code>: מערך של אנשי הקשר שעובדו עם כל השדות המשופרים (שמות עמודות בעברית).</li>
                <li><code className="text-indigo-600 bg-indigo-50 px-1 rounded">processing_summary</code>: אובייקט המסכם את פעולות העיבוד.</li>
                <li><code className="text-indigo-600 bg-indigo-50 px-1 rounded">detailed_report</code>: מערך עם דוח מפורט על הפעולות שבוצעו לכל רשומה.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">תשובות שגיאה</h3>
              <p className="text-slate-600 mb-1">במקרה של שגיאה, התשובה תכיל אובייקט JSON עם שדה <code className="text-indigo-600 bg-indigo-50 px-1 rounded">error</code> ותיאור הבעיה. קודי הסטטוס הנפוצים יהיו:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                <li><code className="text-red-600 bg-red-50 px-1 rounded">400 Bad Request</code>: קלט לא תקין (למשל, יותר מ-10 רשומות, שדות חסרים, JSON לא תקין).</li>
                <li><code className="text-red-600 bg-red-50 px-1 rounded">401 Unauthorized</code>: טוקן API לא תקין, פג תוקף או חסר.</li>
                <li><code className="text-red-600 bg-red-50 px-1 rounded">429 Too Many Requests</code>: יותר מדי בקשות בפרק זמן קצר (אם תוגדר מגבלת קצב).</li>
                <li><code className="text-red-600 bg-red-50 px-1 rounded">500 Internal Server Error</code>: שגיאה פנימית בשרת במהלך העיבוד.</li>
              </ul>
            </section>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}