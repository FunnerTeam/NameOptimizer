import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  BarChart3,
  CheckCircle,
  ShieldCheck,
  Settings2,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center"
    whileHover={{ y: -5 }}
  >
    <div className="bg-teal-100 text-teal-600 p-4 rounded-full mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </motion.div>
);

FeatureCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const StepCard = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="relative mb-4">
      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center rounded-full text-2xl font-bold shadow-md">
        {number}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-500">{description}</p>
  </div>
);

StepCard.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default function LandingPage() {
  const navigate = useNavigate();

  const handleAuth = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // אם יש טוקן, עבור ישירות לעמוד העלאה
      navigate("/upload");
    } else {
      // אם אין טוקן, עבור לעמוד התחברות
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir="rtl">
      <header className="py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-l from-teal-700 to-emerald-700 bg-clip-text text-transparent">
              שמטוב
            </span>
          </Link>
          <Button
            onClick={handleAuth}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            התחבר / הירשם
          </Button>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 text-center bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 text-white relative"
      >
        <div className="max-w-3xl mx-auto">
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              type: "spring",
              stiffness: 100,
            }}
          >
            הפכו כאוס נתונים לסדר מופתי עם{" "}
            <span className="text-yellow-300">שמטוב</span>
          </motion.h1>
          <p className="text-xl md:text-2xl mb-10 font-light">
            טיוב, ניקוי והעשרת נתוני אנשי קשר מקבצי CSV מעולם לא היו פשוטים
            יותר. חסכו זמן יקר, שפרו את איכות הנתונים והגדילו את יעילות העסק
            שלכם.
          </p>
          <Button
            onClick={handleAuth}
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 px-10 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            התחילו עכשיו בחינם!
          </Button>
        </div>
      </motion.section>

      <section className="py-16 px-4 bg-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            נמאס לכם מנתונים מבולגנים?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            שגיאות כתיב, פורמטים לא אחידים, מידע חסר... נתונים לא איכותיים
            פוגעים ביכולת שלכם לקבל החלטות, לבצע קמפיינים יעילים ולספק שירות
            מעולה.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center" dir="rtl">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                איבודי זמן ותסכול
              </h3>
              <p className="text-slate-600">
                חיפוש ידני ותיקון שגיאות גוזלים שעות עבודה יקרות.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                החלטות מבוססות מידע שגוי
              </h3>
              <p className="text-slate-600">
                נתונים לא מדויקים מובילים לתובנות שגויות והחלטות עסקיות לא
                אופטימליות.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                פגיעה בחווית לקוח
              </h3>
              <p className="text-slate-600">
                שליחת מסרים שגויים או פניות כפולות פוגעות באמינות ובשביעות רצון
                הלקוחות.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              שמטוב - הפתרון החכם לנתונים שלכם
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              כלי עוצמתי מבוסס AI שמנקה, מתקן, מעשיר ומארגן את רשימות אנשי הקשר
              שלכם בקלות ובמהירות.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="טיוב נתונים אוטומטי"
              description="תיקון שמות, נרמול טלפונים, אימות כתובות מייל ועוד - הכל באופן אוטומטי וחכם."
            />
            <FeatureCard
              icon={Settings2}
              title="מיפוי עמודות גמיש"
              description="התאמה אישית מלאה של שדות ה-CSV שלכם לשדות היעד הרצויים, עם זיהוי אוטומטי חכם."
            />
            <FeatureCard
              icon={SparklesIcon}
              title="העשרת נתונים חכמה"
              description="זיהוי מין, פיצול שמות מורכבים, איתור תארים ועוד באמצעות בינה מלאכותית."
            />
            <FeatureCard
              icon={CheckCircle}
              title="אימות ותיקנון"
              description="בדיקת תקינות פורמטים, הסרת כפילויות פוטנציאליות וסטנדרטיזציה של הנתונים."
            />
            <FeatureCard
              icon={BarChart3}
              title="דוחות מפורטים"
              description="קבלו דוח מפורט על כל השינויים והתיקונים שבוצעו, להבנה מלאה של תהליך הטיוב."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="מאובטח ופרטי"
              description="הנתונים שלכם מעובדים בצורה מאובטחת ונשארים בשליטתכם המלאה."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-100 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">
              קל ופשוט כמו 1-2-3
            </h2>
            <p className="text-lg text-slate-600">
              תהליך טיוב הנתונים עם שמטוב הוא מהיר וידידותי למשתמש.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            <StepCard
              number="1"
              title="העלאת קובץ CSV"
              description="העלו בקלות את קובץ אנשי הקשר שלכם למערכת."
            />
            <StepCard
              number="2"
              title="מיפוי עמודות חכם"
              description="אשרו או התאימו את מיפוי העמודות האוטומטי שהמערכת מציעה."
            />
            <StepCard
              number="3"
              title="קבלו נתונים מטויבים"
              description="הורידו את הקובץ המשופר ודוח מפורט תוך דקות."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            היתרונות שלכם עם שמטוב
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            מעבר לנתונים נקיים, שמטוב מעניק לכם יתרונות עסקיים משמעותיים.
          </p>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-10 h-10 text-teal-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-1">
                  חיסכון אדיר בזמן ומשאבים
                </h3>
                <p className="text-slate-600">
                  צמצמו שעות עבודה ידניות והתמקדו במה שחשוב באמת.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-10 h-10 text-teal-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-1">
                  שיפור בקבלת החלטות
                </h3>
                <p className="text-slate-600">
                  בססו אסטרטגיות על נתונים מדויקים ואמינים.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-10 h-10 text-teal-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-1">
                  הגברת יעילות שיווקית
                </h3>
                <p className="text-slate-600">
                  שפרו את הפילוח והגדילו את אחוזי ההמרה של הקמפיינים שלכם.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-10 h-10 text-teal-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-1">
                  חווית לקוח משופרת
                </h3>
                <p className="text-slate-600">
                  הבטיחו תקשורת מדויקת ומותאמת אישית עם הלקוחות שלכם.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            מוכנים להפוך את הנתונים שלכם לנכס?
          </h2>
          <p className="text-xl mb-10">
            הצטרפו למשתמשים שכבר נהנים מנתונים איכותיים ומדויקים. הירשמו עכשיו
            ותתחילו לראות תוצאות באופן מיידי.
          </p>
          <Button
            onClick={handleAuth}
            size="lg"
            variant="secondary"
            className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 px-10 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            נסו את שמטוב בחינם!
          </Button>
        </div>
      </section>

      <footer className="py-8 px-4 text-center bg-slate-800 text-slate-400">
        <p>&copy; {new Date().getFullYear()} שמטוב. כל הזכויות שמורות.</p>
      </footer>
    </div>
  );
}
