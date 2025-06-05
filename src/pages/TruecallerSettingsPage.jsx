import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TruecallerSettings } from "@/api/entities";
import { PhoneOutgoing, AlertTriangle, CheckCircle, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function TruecallerSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settingsList = await TruecallerSettings.list();
        if (settingsList.length > 0) {
          const currentSettings = settingsList[0];
          setApiKey(currentSettings.api_key || "");
          setIsEnabled(currentSettings.is_enabled || false);
          setSettingsId(currentSettings.id);
        }
      } catch (error) {
        console.error("Error loading Truecaller settings:", error);
        alert("שגיאה בטעינת הגדרות Truecaller.");
      }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    const settingsData = { api_key: apiKey, is_enabled: isEnabled };
    try {
      if (settingsId) {
        await TruecallerSettings.update(settingsId, settingsData);
      } else {
        const newSettings = await TruecallerSettings.create(settingsData);
        setSettingsId(newSettings.id);
      }
      alert("הגדרות Truecaller נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving Truecaller settings:", error);
      alert("שגיאה בשמירת הגדרות Truecaller.");
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="glass-effect shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center">
              <PhoneOutgoing className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">
              הגדרות אינטגרציה - Truecaller
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600">
            נהל את החיבור לשירות Truecaller להעשרת נתוני אנשי קשר. שים לב:
            אינטגרציה זו דורשת מפתח API בתוקף משירות Truecaller למפתחים ומימוש
            בצד השרת.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">הבהרה חשובה:</h4>
              <p className="text-sm">
                הגדרת מפתח API כאן מאפשרת למערכת להיות מוכנה לשימוש
                ב-Truecaller. הקריאות בפועל ל-API של Truecaller צריכות להיות
                ממומשות בצד השרת (Backend) של אפליקציה זו. ללא מימוש כזה,
                ההגדרות לא יפעילו העשרת נתונים אוטומטית.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="truecaller-apikey"
              className="text-slate-700 font-medium"
            >
              מפתח API של Truecaller
            </Label>
            <Input
              id="truecaller-apikey"
              type="password"
              placeholder="הדבק כאן את מפתח ה-API שלך"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="text-left"
              dir="ltr"
            />
            <p className="text-xs text-slate-500">
              ניתן להשיג מפתח API מפורטל המפתחים של Truecaller.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-0.5">
              <Label
                htmlFor="truecaller-enabled"
                className="text-slate-700 font-medium"
              >
                הפעל אינטגרציית Truecaller
              </Label>
              <p className="text-xs text-slate-500">
                מאפשר למערכת לנסות להשתמש ב-Truecaller (בכפוף למימוש Backend).
              </p>
            </div>
            <Switch
              id="truecaller-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              disabled={!apiKey}
            />
          </div>

          {isEnabled && apiKey && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>
                Truecaller מוגדר כפעיל. המערכת תנסה להשתמש בו בהתאם להגדרות
                העיבוד.
              </span>
            </div>
          )}

          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="w-full bg-gradient-to-l from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-lg py-3"
          >
            <Save className="w-5 h-5 ml-2" />
            {isLoading ? "שומר..." : "שמור הגדרות Truecaller"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
