import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings as SettingsIcon,
  Save,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import axios instance for API calls
import axiosInstance from "../utils/axiosInstance";

const SettingItem = ({ label, description, children, tooltipContent }) => (
  <div className="py-4 border-b border-slate-200 last:border-b-0">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="space-y-0.5 flex-grow">
        <div className="flex items-center gap-1">
          <Label className="text-slate-800 font-medium text-base">
            {label}
          </Label>
          {tooltipContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-xs bg-slate-700 text-white p-2 rounded shadow-lg text-right"
                  side="top"
                >
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <div className="w-full sm:w-auto sm:min-w-[200px] flex justify-start sm:justify-end">
        {children}
      </div>
    </div>
  </div>
);

export default function ProcessingDefaultsPage() {
  const [settings, setSettings] = useState({
    truecaller_usage: "never",
    truecaller_name_field: "שם מ-Truecaller",
    name_title_handling: "separate_field",
    gender_assignment: true,
    variation_handling: "standardize_add_note",
    phone_format_preference: "with_hyphen",
  });
  const [settingsId, setSettingsId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await axiosInstance.get("/api/processing-settings");

        if (response.data.success) {
          setSettings(response.data.data);
          setSettingsId(response.data.isDefault ? null : response.data.data.id);
        } else {
          throw new Error(response.data.error || "שגיאה בטעינת הגדרות");
        }
      } catch (error) {
        console.error("Error loading processing settings:", error);
        setError("שגיאה בטעינת הגדרות עיבוד. בדוק את החיבור לשרת.");
      }

      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveMessage(""); // נקה הודעות קודמות
    setError("");
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await axiosInstance.post(
        "/api/processing-settings",
        settings
      );

      if (response.data.success) {
        setSettingsId(response.data.data.id);
        setSaveMessage("הגדרות העיבוד נשמרו בהצלחה!");

        // נקה הודעה אחרי 3 שניות
        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      } else {
        throw new Error(response.data.error || "שגיאה בשמירת הגדרות");
      }
    } catch (error) {
      console.error("Error saving processing settings:", error);
      setError(error.response?.data?.error || "שגיאה בשמירת הגדרות עיבוד.");
    }

    setIsLoading(false);
  };

  const handleResetSettings = async () => {
    if (!confirm("האם אתה בטוח שברצונך לאפס את כל ההגדרות לברירות מחדל?")) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await axiosInstance.delete("/api/processing-settings");

      if (response.data.success) {
        // איפוס להגדרות ברירת מחדל
        setSettings({
          truecaller_usage: "never",
          truecaller_name_field: "שם מ-Truecaller",
          name_title_handling: "separate_field",
          gender_assignment: true,
          variation_handling: "standardize_add_note",
          phone_format_preference: "with_hyphen",
        });
        setSettingsId(null);
        setSaveMessage("הגדרות אופסו לברירות מחדל!");

        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      } else {
        throw new Error(response.data.error || "שגיאה באיפוס הגדרות");
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      setError(error.response?.data?.error || "שגיאה באיפוס הגדרות.");
    }

    setIsLoading(false);
  };

  if (isLoading && !settingsId) {
    return (
      <div className="flex justify-center items-center h-64">
        <SettingsIcon className="w-12 h-12 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="glass-effect shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">
              הגדרות עיבוד נתונים
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600">
            קבע כיצד המערכת תטפל בנתונים שלך כברירת מחדל. הגדרות אלו ישפיעו על
            תהליך טיוב הנתונים.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {/* הודעות שגיאה והצלחה */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {saveMessage && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}

          <SettingItem
            label="שימוש באינטגרציית Truecaller"
            description="קובע מתי ואם המערכת תנסה להשתמש ב-Truecaller להעשרת שמות (מותנה בחיבור תקין ומימוש Backend)."
            tooltipContent="אפשרות 'תמיד (הוסף עמודה)' תוסיף עמודה חדשה עם השם מ-Truecaller, בנוסף לשם המקורי והמשופר. 'רק אם שם חסר' תנסה למלא שם רק אם לא זוהה שם בקלט."
          >
            <Select
              value={settings.truecaller_usage}
              onValueChange={(value) =>
                handleSettingChange("truecaller_usage", value)
              }
              dir="rtl"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">אף פעם</SelectItem>
                <SelectItem value="if_name_missing">
                  רק אם שם מקורי חסר/לא זוהה
                </SelectItem>
                <SelectItem value="always_enrich">
                  תמיד (הוסף עמודה עם השם מ-Truecaller)
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingItem>

          {settings.truecaller_usage === "always_enrich" && (
            <SettingItem
              label="שם עמודה עבור שם מ-Truecaller"
              description="הגדר את שם הכותרת לעמודה שתכיל את השם המתקבל מ-Truecaller."
              tooltipContent="יופיע רק אם בחרת 'תמיד (הוסף עמודה)' באפשרות הקודמת."
            >
              <Input
                value={settings.truecaller_name_field}
                onChange={(e) =>
                  handleSettingChange("truecaller_name_field", e.target.value)
                }
              />
            </SettingItem>
          )}

          <SettingItem
            label='טיפול בתארים בשמות (ד"ר, עו"ד וכו&apos;)'
            description="כיצד המערכת תטפל בתארים המופיעים לצד שמות."
            tooltipContent="'הסר תארים': יסיר תארים מהשם. 'הוסף כקידומת': ישאיר את התואר כחלק מהשם הפרטי. 'העבר לשדה נפרד': יפריד את התואר לעמודה ייעודית בשם 'תואר שזוהה'."
          >
            <Select
              value={settings.name_title_handling}
              onValueChange={(value) =>
                handleSettingChange("name_title_handling", value)
              }
              dir="rtl"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remove">הסר תארים</SelectItem>
                <SelectItem value="prefix_firstname">
                  השאר כקידומת לשם הפרטי
                </SelectItem>
                <SelectItem value="separate_field">
                  העבר לשדה 'תואר שזוהה' נפרד
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingItem>

          <SettingItem
            label="שיוך מגדר אוטומטי"
            description="האם לאפשר למערכת לנסות לשייך מגדר (זכר/נקבה) על בסיס השם הפרטי ומאגרי השמות."
            tooltipContent="אם מאופשר, המערכת תנסה לזהות את מין האדם על פי שמו הפרטי, בהתבסס על רשימות שמות בנים ובנות. התוצאה תופיע בעמודת 'מגדר משוער'."
          >
            <Switch
              checked={settings.gender_assignment}
              onCheckedChange={(value) =>
                handleSettingChange("gender_assignment", value)
              }
              dir="ltr"
            />
          </SettingItem>

          <SettingItem
            label="טיפול בווריאציות איות (ערים/שמות)"
            description='כיצד לטפל בשמות שיש להם צורות כתיב שונות (לדוגמה, פ"ת ופתח תקווה).'
            tooltipContent="'נסה לתקנן והוסף הערה': המערכת תנסה לאחד לשם סטנדרטי ותציין את הווריאציה בעמודת הערות. 'השאר מקורי': ישאיר את השם כפי שהופיע בקלט."
          >
            <Select
              value={settings.variation_handling}
              onValueChange={(value) =>
                handleSettingChange("variation_handling", value)
              }
              dir="rtl"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standardize_add_note">
                  נסה לתקנן לשם סטנדרטי והוסף הערה
                </SelectItem>
                <SelectItem value="keep_original">
                  השאר כפי שהיה במקור
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingItem>

          <SettingItem
            label="פורמט טלפון מועדף (לאחר תיקון)"
            description="בחר את הפורמט שבו יוצגו מספרי טלפון לאחר שעברו תיקון וסטנדרטיזציה."
            tooltipContent="לדוגמה, 'עם מקף': 050-1234567. 'רק ספרות': 0501234567."
          >
            <Select
              value={settings.phone_format_preference}
              onValueChange={(value) =>
                handleSettingChange("phone_format_preference", value)
              }
              dir="rtl"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="with_hyphen">
                  עם מקף (לדוגמה: 050-1234567)
                </SelectItem>
                <SelectItem value="digits_only">
                  רק ספרות (לדוגמה: 0501234567)
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingItem>

          <div className="pt-6 mt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-lg py-3"
            >
              <Save className="w-5 h-5 ml-2" />
              {isLoading ? "שומר..." : "שמור הגדרות עיבוד"}
            </Button>
          </div>

          <div className="pt-6 mt-4">
            <Button
              onClick={handleResetSettings}
              disabled={isLoading}
              className="w-full bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-lg py-3"
            >
              <Save className="w-5 h-5 ml-2" />
              {isLoading ? "איפוס..." : "איפוס הגדרות עיבוד"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
