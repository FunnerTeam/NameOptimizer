# דיפלוי Name Optimizer להרוקו

## דרישות מוקדמות

1. חשבון Heroku
2. Heroku CLI מותקן
3. Git
4. פרויקט Supabase פעיל

## שלבי הדיפלוי

### 1. התקנת Heroku CLI

```bash
# Windows
winget install Heroku.CLI

# macOS
brew tap heroku/brew && brew install heroku

# או הורד מ: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. התחברות להרוקו

```bash
heroku login
```

### 3. יצירת אפליקציה חדשה

```bash
heroku create your-app-name
```

### 4. הגדרת משתני סביבה

```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
heroku config:set JWT_SECRET=your-super-secret-jwt-key
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
```

### 5. דיפלוי הקוד

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 6. פתיחת האפליקציה

```bash
heroku open
```

## בדיקת לוגים

```bash
heroku logs --tail
```

## הערות חשובות

- הפרויקט בנוי כ-SPA שמשרת גם את הAPI וגם את הfrontend
- ה-backend יבנה את הfrontend אוטומטית במהלך הדיפלוי
- וודא שמשתני הסביבה מוגדרים נכון לפני הדיפלוי
- הפורט נקבע אוטומטי על ידי הרוקו
