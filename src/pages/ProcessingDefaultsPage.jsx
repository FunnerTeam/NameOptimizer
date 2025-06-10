import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import PropTypes from "prop-types";

// Import axios instance for API calls
import axiosInstance from "../utils/axiosInstance";

const SettingItem = ({ label, description, children, tooltipContent }) => (
  <div className="py-6 border-b border-indigo-100 last:border-b-0">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="space-y-1 flex-grow">
        <div className="flex items-center gap-2">
          <Label className="text-slate-800 font-semibold text-lg">
            {label}
          </Label>
          {tooltipContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center cursor-help">
                    <Info className="w-3 h-3 text-white" />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-xs bg-slate-800 text-white p-3 rounded-xl shadow-xl text-right border border-slate-600"
                  side="top"
                >
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {description && (
          <p className="text-slate-600 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="w-full sm:w-auto sm:min-w-[250px] flex justify-start sm:justify-end">
        {children}
      </div>
    </div>
  </div>
);

SettingItem.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  tooltipContent: PropTypes.string,
};

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
      <div
        className="min-h-[93vh] p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
        dir="rtl"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="glass-effect border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                <SettingsIcon className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                טוען הגדרות...
              </h3>
              <p className="text-slate-600">מחפש את ההגדרות שלך</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[93vh] p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              הגדרות עיבוד נתונים
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            קבע כיצד המערכת תטפל בנתונים שלך כברירת מחדל. הגדרות אלו ישפיעו על
            תהליך טיוב הנתונים.
          </p>
        </motion.div>

        <Card className="glass-effect border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* הודעות שגיאה והצלחה */}
            {error && (
              <Alert
                variant="destructive"
                className="mb-6 bg-red-50/80 backdrop-blur-sm border-red-200"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {saveMessage && (
              <Alert className="mb-6 bg-green-50/80 border-green-200 backdrop-blur-sm">
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
                <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
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
                  className="border-indigo-200 focus:border-indigo-400"
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
                <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
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
                <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
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
                <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
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

            <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-6 border-t border-indigo-100">
              <Button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-3"
              >
                <Save className="w-5 h-5 ml-2" />
                {isLoading ? "שומר..." : "שמור הגדרות עיבוד"}
              </Button>

              <Button
                onClick={handleResetSettings}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 backdrop-blur-sm text-lg py-3"
              >
                <SettingsIcon className="w-5 h-5 ml-2" />
                {isLoading ? "מאפס..." : "איפוס לברירות מחדל"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

ProcessingDefaultsPage.propTypes = {
  // Add any necessary prop types here
};
