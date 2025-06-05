const jwt = require("jsonwebtoken");

/**
 * יצירת JWT token עם פרטי משתמש
 * @param {Object} userProps - פרטי המשתמש (email, name, _id)
 * @returns {string} JWT token
 */
function generateUserToken(userProps) {
  const { email, name, _id } = userProps;

  // בדיקת תקינות נתונים
  if (!email || !_id) {
    throw new Error("אימייל ומזהה משתמש נדרשים ליצירת token");
  }

  // הגדרת payload לtoken
  const payload = {
    userId: _id,
    email,
    name: name || "משתמש",
    iat: Math.floor(Date.now() / 1000), // זמן יצירה
  };

  // יצירת token עם תוקף של 24 שעות
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
    issuer: "name-optimizer",
    audience: "name-optimizer-users",
  });

  return token;
}

module.exports = generateUserToken;
