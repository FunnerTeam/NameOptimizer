const jwt = require("jsonwebtoken");

/**
 * Middleware לבדיקת אימות JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function authMiddleware(req, res, next) {
  try {
    // קבלת token מheader
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "לא נמצא token אימות",
        code: "NO_TOKEN",
      });
    }

    // בדיקת פורמט: "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "פורמט token לא תקין",
        code: "INVALID_TOKEN_FORMAT",
      });
    }

    // אימות token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "name-optimizer",
      audience: "name-optimizer-users",
    });

    // הוספת פרטי משתמש לrequest
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error("שגיאת אימות:", error.message);

    // טיפול בסוגי שגיאות שונים
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token פג תוקף",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Token לא תקין",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(401).json({
      success: false,
      error: "שגיאת אימות",
      code: "AUTH_ERROR",
    });
  }
}

/**
 * Middleware אופציונלי - לא דורש אימות אבל מנסה לזהות משתמש
 */
function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "name-optimizer",
      audience: "name-optimizer-users",
    });

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    // אם יש שגיאה, פשוט ממשיכים בלי משתמש
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
