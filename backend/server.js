require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Import auth routes and middleware
const authRoutes = require("./routes/auth");
const { authMiddleware } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("🚨 חסר SUPABASE_SERVICE_ROLE_KEY ב-.env");
  console.error("💡 צור קובץ .env עם SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL || "https://dzgtyoflcgynpfthxfsq.supabase.co",
  serviceRoleKey
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "יותר מדי בקשות, נסה שוב מאוחר יותר",
  },
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com",
          "https://apis.google.com",
          "https://gsi.gstatic.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://www.googleapis.com",
          "https://oauth2.googleapis.com",
        ],
        frameSrc: ["'self'", "https://accounts.google.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api", limiter);

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
}

// Multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("רק קבצי CSV מותרים"));
    }
  },
});

// Utility functions
function generateUniqueFilename(originalname) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalname.split(".").pop();
  return `${timestamp}_${random}.${extension}`;
}

async function uploadToSupabase(
  fileBuffer,
  filename,
  bucket = "processed-files"
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, fileBuffer, {
        contentType: "text/csv",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return {
      success: true,
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error("שגיאה בהעלאה לSupabase:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "השרת פועל בהצלחה",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    server: "Name Optimizer Backend",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Save processing results - now requires authentication and accepts files
app.post(
  "/api/save-processing",
  authMiddleware,
  upload.fields([
    { name: "cleanedFile", maxCount: 1 },
    { name: "detailedFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { originalFilename, totalRows, summary } = req.body;
      const cleanedFile = req.files?.cleanedFile?.[0];
      const detailedFile = req.files?.detailedFile?.[0];

      // Get user info from authenticated token
      const userEmail = req.user.email;
      const userName = req.user.name;
      const userId = req.user.userId;

      // Validation
      if (!originalFilename || !cleanedFile) {
        return res.status(400).json({
          success: false,
          error: "חסרים נתונים חובה",
        });
      }

      const processingId = uuidv4();
      const timestamp = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Generate unique filenames
      const cleanedFilename = generateUniqueFilename(
        `${originalFilename}_cleaned.csv`
      );
      const detailedFilename = detailedFile
        ? generateUniqueFilename(`${originalFilename}_detailed.csv`)
        : null;

      // Upload files to Supabase Storage directly from buffer
      const cleanedUpload = await uploadToSupabase(
        cleanedFile.buffer,
        cleanedFilename
      );
      if (!cleanedUpload.success) {
        throw new Error(`שגיאה בהעלאת קובץ מנוקה: ${cleanedUpload.error}`);
      }

      let detailedUpload = null;
      if (detailedFile && detailedFilename) {
        detailedUpload = await uploadToSupabase(
          detailedFile.buffer,
          detailedFilename
        );
        if (!detailedUpload.success) {
          console.warn("שגיאה בהעלאת קובץ מפורט:", detailedUpload.error);
        }
      }

      // Parse summary if it's a string
      let summaryData = summary;
      if (typeof summary === "string") {
        try {
          summaryData = JSON.parse(summary);
        } catch (e) {
          console.warn("שגיאה בפרסור summary:", e);
        }
      }

      // Save record to database
      const { data, error } = await supabase
        .from("contact_processing")
        .insert({
          id: processingId,
          user_id: userId,
          created_by: userName || userEmail || "משתמש",
          original_filename: originalFilename,
          processed_file_url: cleanedUpload.publicUrl,
          detailed_report_file_url: detailedUpload?.publicUrl || null,
          total_rows: parseInt(totalRows) || 0,
          improvements_summary: summaryData,
          created_date: timestamp,
          expires_at: expiresAt.toISOString(),
          status: "completed",
        })
        .select()
        .single();

      if (error) {
        throw new Error(`שגיאה בשמירת נתונים: ${error.message}`);
      }

      res.json({
        success: true,
        data: {
          id: data.id,
          processedFileUrl: data.processed_file_url,
          detailedReportUrl: data.detailed_report_file_url,
          expiresAt: data.expires_at,
        },
        message: "נתונים נשמרו בהצלחה",
      });
    } catch (error) {
      console.error("שגיאה בשמירת עיבוד:", error);
      res.status(500).json({
        success: false,
        error: error.message || "שגיאה פנימית בשרת",
      });
    }
  }
);

// Get processing history - now requires authentication
app.get("/api/processing-history", authMiddleware, async (req, res) => {
  try {
    // Get user ID from authenticated token instead of query params
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("contact_processing")
      .select("*")
      .eq("user_id", userId)
      .order("created_date", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`שגיאה בקריאת נתונים: ${error.message}`);
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("שגיאה בקבלת היסטוריה:", error);
    res.status(500).json({
      success: false,
      error: error.message || "שגיאה פנימית בשרת",
      data: [],
    });
  }
});

// Delete processing record - now requires authentication
app.delete("/api/processing/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // Get user ID from authenticated token instead of request body
    const userId = req.user.userId;

    // First, get the record to check ownership and get file URLs
    const { data: record, error: fetchError } = await supabase
      .from("contact_processing")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !record) {
      return res.status(404).json({
        success: false,
        error: "רשומה לא נמצאה או אין הרשאה",
      });
    }

    // Delete files from storage
    if (record.processed_file_url) {
      const filename = record.processed_file_url.split("/").pop();
      await supabase.storage.from("processed-files").remove([filename]);
    }

    if (record.detailed_report_file_url) {
      const filename = record.detailed_report_file_url.split("/").pop();
      await supabase.storage.from("processed-files").remove([filename]);
    }

    // Delete record from database
    const { error: deleteError } = await supabase
      .from("contact_processing")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error(`שגיאה במחיקת רשומה: ${deleteError.message}`);
    }

    res.json({
      success: true,
      message: "רשומה נמחקה בהצלחה",
    });
  } catch (error) {
    console.error("שגיאה במחיקת רשומה:", error);
    res.status(500).json({
      success: false,
      error: error.message || "שגיאה פנימית בשרת",
    });
  }
});

// Processing Settings API Routes

// Get user's processing settings
app.get("/api/processing-settings", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("processing_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      throw new Error(`שגיאה בקריאת הגדרות: ${error.message}`);
    }

    // אם לא נמצאו הגדרות, החזר ברירות מחדל
    if (!data) {
      const defaultSettings = {
        truecaller_usage: "never",
        truecaller_name_field: "שם מ-Truecaller",
        name_title_handling: "separate_field",
        gender_assignment: true,
        variation_handling: "standardize_add_note",
        phone_format_preference: "with_hyphen",
      };

      res.json({
        success: true,
        data: defaultSettings,
        isDefault: true,
      });
    } else {
      res.json({
        success: true,
        data: data,
        isDefault: false,
      });
    }
  } catch (error) {
    console.error("שגיאה בקבלת הגדרות עיבוד:", error);
    res.status(500).json({
      success: false,
      error: error.message || "שגיאה פנימית בשרת",
    });
  }
});

// Save/Update user's processing settings
app.post("/api/processing-settings", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      truecaller_usage,
      truecaller_name_field,
      name_title_handling,
      gender_assignment,
      variation_handling,
      phone_format_preference,
    } = req.body;

    // בדיקת תקינות נתונים
    const validTruecallerUsage = ["never", "if_name_missing", "always_enrich"];
    const validNameTitleHandling = [
      "remove",
      "prefix_firstname",
      "separate_field",
    ];
    const validVariationHandling = ["standardize_add_note", "keep_original"];
    const validPhoneFormat = ["with_hyphen", "digits_only"];

    if (!validTruecallerUsage.includes(truecaller_usage)) {
      return res.status(400).json({
        success: false,
        error: "ערך לא תקין עבור שימוש ב-Truecaller",
      });
    }

    if (!validNameTitleHandling.includes(name_title_handling)) {
      return res.status(400).json({
        success: false,
        error: "ערך לא תקין עבור טיפול בתארים",
      });
    }

    if (!validVariationHandling.includes(variation_handling)) {
      return res.status(400).json({
        success: false,
        error: "ערך לא תקין עבור טיפול בווריאציות",
      });
    }

    if (!validPhoneFormat.includes(phone_format_preference)) {
      return res.status(400).json({
        success: false,
        error: "ערך לא תקין עבור פורמט טלפון",
      });
    }

    const settingsData = {
      user_id: userId,
      truecaller_usage,
      truecaller_name_field: truecaller_name_field || "שם מ-Truecaller",
      name_title_handling,
      gender_assignment: Boolean(gender_assignment),
      variation_handling,
      phone_format_preference,
    };

    // בדוק אם כבר קיימות הגדרות למשתמש
    const { data: existingSettings } = await supabase
      .from("processing_settings")
      .select("id")
      .eq("user_id", userId)
      .single();

    let result;
    if (existingSettings) {
      // עדכן הגדרות קיימות
      const { data, error } = await supabase
        .from("processing_settings")
        .update(settingsData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(`שגיאה בעדכון הגדרות: ${error.message}`);
      }
      result = data;
    } else {
      // צור הגדרות חדשות
      const { data, error } = await supabase
        .from("processing_settings")
        .insert(settingsData)
        .select()
        .single();

      if (error) {
        throw new Error(`שגיאה ביצירת הגדרות: ${error.message}`);
      }
      result = data;
    }

    res.json({
      success: true,
      data: result,
      message: "הגדרות עיבוד נשמרו בהצלחה",
    });
  } catch (error) {
    console.error("שגיאה בשמירת הגדרות עיבוד:", error);
    res.status(500).json({
      success: false,
      error: error.message || "שגיאה פנימית בשרת",
    });
  }
});

// Delete user's processing settings (reset to defaults)
app.delete("/api/processing-settings", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { error } = await supabase
      .from("processing_settings")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new Error(`שגיאה במחיקת הגדרות: ${error.message}`);
    }

    res.json({
      success: true,
      message: "הגדרות עיבוד אופסו לברירות מחדל",
    });
  } catch (error) {
    console.error("שגיאה במחיקת הגדרות עיבוד:", error);
    res.status(500).json({
      success: false,
      error: error.message || "שגיאה פנימית בשרת",
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error("שגיאה לא מטופלת:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "הקובץ גדול מדי",
      });
    }
  }

  res.status(500).json({
    success: false,
    error: "שגיאה פנימית בשרת",
  });
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "נתיב לא נמצא",
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `📊 Supabase URL: ${
      process.env.SUPABASE_URL ? "Connected" : "Using default"
    }`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🔄 מקבל SIGTERM. כיבוי מבוקר...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🔄 מקבל SIGINT. כיבוי מבוקר...");
  process.exit(0);
});

module.exports = app;
