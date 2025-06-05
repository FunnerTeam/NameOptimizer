const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");
const generateUserToken = require("../utils/generateUserToken");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Supabase client (משתמש באותו client כמו בserver.js)
const supabase = createClient(
  process.env.SUPABASE_URL || "https://dzgtyoflcgynpfthxfsq.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6Z3R5b2ZsY2d5bnBmdGh4ZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjA4NjEsImV4cCI6MjA2NDYzNjg2MX0.GReb8ozdFD4YhFT65NFsTUFKwIFgxP_D2hQEQelefGM"
);

/**
 * POST /api/auth/login
 * אימות עם Google וקבלת JWT token פנימי (alias ל-google-login)
 */
router.post("/login", async (req, res) => {
  try {
    const { googleAccessToken } = req.body;

    if (!googleAccessToken) {
      return res.status(400).json({
        success: false,
        error: "Google Access Token נדרש",
      });
    }

    console.log("מתחיל תהליך אימות Google...");

    // אימות token מול Google ושליפת פרטי משתמש
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleAccessToken}`
    );

    const { email, name, picture } = googleResponse.data;

    if (!email) {
      throw new Error("לא התקבל אימייל מGoogle");
    }

    console.log(`משתמש מGoogle: ${email}, ${name}`);

    // בדיקה אם המשתמש קיים בטבלת Users
    let { data: userData, error: fetchError } = await supabase
      .from("users") // שם הטבלה הקיימת
      .select("*")
      .eq("email", email)
      .single();

    // אם המשתמש לא קיים - יצירת משתמש חדש
    if (fetchError && fetchError.code === "PGRST116") {
      console.log("משתמש לא נמצא, יוצר משתמש חדש...");

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email,
            name: name || "משתמש",
            created_at: new Date().toISOString(),
          },
        ])
        .select("*")
        .single();

      if (insertError) {
        console.error("שגיאה ביצירת משתמש:", insertError);
        throw new Error(`שגיאה ביצירת משתמש: ${insertError.message}`);
      }

      userData = newUser;
      console.log("משתמש חדש נוצר:", userData.id);
    } else if (fetchError) {
      console.error("שגיאה בשליפת משתמש:", fetchError);
      throw new Error(`שגיאה בשליפת משתמש: ${fetchError.message}`);
    } else {
      // עדכון last_login למשתמש קיים
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", userData.id);

      console.log("משתמש קיים נמצא:", userData.id);
    }

    // יצירת JWT token פנימי
    const tokenProps = {
      email: userData.email,
      name: userData.name,
      _id: userData.id,
    };

    const jwtToken = generateUserToken(tokenProps);

    console.log("JWT token נוצר בהצלחה");

    // החזרת רק token כמו שציפית
    res.json({
      token: jwtToken,
    });
  } catch (error) {
    console.error("שגיאה בתהליך התחברות:", error.message);

    // טיפול בסוגי שגיאות שונים
    if (error.response && error.response.status === 401) {
      return res.status(401).json({
        success: false,
        error: "Google Access Token לא תקין",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "שגיאה פנימית בשרת",
    });
  }
});

/**
 * GET /api/auth/validate-token
 * בדיקת תקינות JWT token
 */
router.get("/validate-token", authMiddleware, (req, res) => {
  try {
    // אם הגענו לכאן, זה אומר שהtoken תקין (authMiddleware עבר)
    res.json({
      success: true,
      message: "Token תקין",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "שגיאה בבדיקת token",
    });
  }
});

/**
 * GET /api/auth/user
 * קבלת פרטי המשתמש הנוכחי
 */
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // שליפת פרטים מעודכנים מהDB
    const { data: userData, error } = await supabase
      .from("users")
      .select("id, email, name, profile_picture, created_at, last_login")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`שגיאה בשליפת פרטי משתמש: ${error.message}`);
    }

    res.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        profilePicture: userData.profile_picture,
        createdAt: userData.created_at,
        lastLogin: userData.last_login,
      },
    });
  } catch (error) {
    console.error("שגיאה בקבלת פרטי משתמש:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "שגיאה בקבלת פרטי משתמש",
    });
  }
});

/**
 * POST /api/auth/logout
 * התנתקות (בעצם רק אישור - הlocalStorage מתנקה בלקוח)
 */
router.post("/logout", authMiddleware, (req, res) => {
  try {
    console.log(`משתמש ${req.user.email} התנתק`);

    res.json({
      success: true,
      message: "התנתקות הצליחה",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "שגיאה בהתנתקות",
    });
  }
});

module.exports = router;
