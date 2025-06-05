# Name Optimizer - מערכת לטיוב והעשרת אנשי קשר

מערכת לניקוי והעשרת רשימות אנשי קשר באמצעות בינה מלאכותית.

## תכונות

- ניקוי וטיוב שמות
- הסרת תארי כבוד
- תיקון מספרי טלפון ישראליים
- אימות כתובות אימייל
- זיהוי והסרת כפולים
- שמירת תוצאות בהיסטוריה למשך 24 שעות
- הורדת קבצים מעובדים

## טכנולוגיות

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Groq API / OpenAI API

## התקנה והרצה

### דרישות מוקדמות

- Node.js v18+
- npm או yarn
- חשבון Supabase

### 1. הגדרת הפרויקט

```bash
# שכפול הפרויקט
git clone <repository-url>
cd name_optimizer

# התקנת תלויות Frontend
npm install

# התקנת תלויות Backend
cd backend
npm install
cd ..
```

### 2. הגדרת Supabase Database

הטבלה כבר נוצרה בפרויקט Supabase: `contact_processing`

### 3. הגדרת משתני סביבה

צור קובץ `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://dzgtyoflcgynpfthxfsq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Z3R5b2ZsY2d5bmZmdGh4ZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4MjA4NjcsImV4cCI6MjA1MDM5Njg2N30.GquJjuE8dBdWGu6m7l51XdnSYGojGvE6J5L2s85-fhE

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE_MB=10
```

צור קובץ `.env.local` בשורש הפרויקט:

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

### 4. הרצת השרתים

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# השרת רץ על http://localhost:3001
```

**Terminal 2 - Frontend:**

```bash
npm run dev
# האתר רץ על http://localhost:5173
```

## שימוש במערכת

### 1. העלאת קובץ CSV

- גרור קובץ CSV או לחץ לבחירה
- הקובץ חייב להכיל עמודות עם נתוני אנשי קשר
- מומלץ קידוד UTF-8 לתמיכה בעברית

### 2. עיבוד הנתונים

- המערכת מעבדת כל שורה באמצעות AI
- ניקוי שמות והסרת תארי כבוד
- תיקון מספרי טלפון לפורמט ישראלי
- אימות כתובות אימייל
- זיהוי והסרת כפולים

### 3. הורדת תוצאות

- קובץ אנשי קשר מנוקים
- דוח מפורט של השינויים

### 4. היסטוריה

- הכנס אימייל לצפייה בעיבודים קודמים
- קבצים זמינים למשך 24 שעות
- אפשרות למחיקת רשומות

## API Endpoints

### Backend API

- `GET /api/health` - בדיקת תקינות השרת
- `POST /api/save-processing` - שמירת תוצאות עיבוד
- `GET /api/processing-history?email=` - קבלת היסטוריה
- `DELETE /api/processing/:id` - מחיקת רשומה

## מבנה הפרויקט

```
name_optimizer/
├── src/                    # Frontend code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── ...
├── backend/               # Backend code
│   ├── server.js          # Express server
│   └── package.json
├── package.json           # Frontend dependencies
└── README.md
```

## בעיות נפוצות

### Backend לא מתחבר

- בדוק שהמפתחות של Supabase נכונים
- ודא שהפורט 3001 פנוי

### שגיאות CORS

- ודא ש-FRONTEND_URL נכון ב-.env של Backend

### בעיות עם קבצי CSV

- ודא קידוד UTF-8
- בדוק שיש כותרות לעמודות
- גודל מקסימלי: 10MB

## פיתוח

### הוספת תכונות חדשות

1. עדכן את הFrontend ב-`src/`
2. הוסף API endpoints ב-`backend/server.js`
3. עדכן את הservices ב-`src/services/`

### הגדרות AI

- שנה בין Groq ל-OpenAI ב-`src/pages/Upload.jsx`
- ערוך את ה-prompts לפי הצרכים

## פריסה ל-Production

### Heroku

1. צור אפליקציה ב-Heroku
2. הוסף את משתני הסביבה
3. פרוס את הBackend
4. פרוס את הFrontend ל-Vercel/Netlify

### משתני סביבה ל-Production

- עדכן FRONTEND_URL לכתובת האמיתית
- שנה NODE_ENV ל-production
- השתמש במפתחות אמיתיים של APIs

## תמיכה

לבעיות או שאלות, פתח issue בגיטהאב.
