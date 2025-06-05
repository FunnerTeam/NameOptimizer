const { createClient } = require("@supabase/supabase-js");

// הגדרת Supabase client
const supabaseUrl =
  process.env.SUPABASE_URL || "https://dzgtyoflcgynpfthxfsq.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // נגדיר בהמשך

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {
  // יצירת או חיפוש משתמש לפי email
  async findOrCreateUser(email, name = null) {
    try {
      // חיפוש משתמש קיים
      const { data: existingUser, error: findError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (existingUser && !findError) {
        return { data: existingUser, error: null };
      }

      // יצירת משתמש חדש אם לא קיים
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            email,
            name: name || email.split("@")[0],
          },
        ])
        .select()
        .single();

      return { data: newUser, error: createError };
    } catch (error) {
      console.error("שגיאה ב-findOrCreateUser:", error);
      return { data: null, error };
    }
  }

  // יצירת רשומת עיבוד חדשה
  async createProcessingRecord(userId, originalFilename, totalRows, summary) {
    try {
      const { data, error } = await supabase
        .from("contact_processing")
        .insert([
          {
            user_id: userId,
            created_by: "", // נשמור גם את האימייל לתאימות אחורה
            original_filename: originalFilename,
            total_rows: totalRows,
            improvements_summary: summary,
            status: "processing",
          },
        ])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("שגיאה ב-createProcessingRecord:", error);
      return { data: null, error };
    }
  }

  // עדכון רשומת עיבוד עם קישורי קבצים
  async updateProcessingRecord(
    processingId,
    processedFileUrl,
    detailedReportFileUrl
  ) {
    try {
      const { data, error } = await supabase
        .from("contact_processing")
        .update({
          processed_file_url: processedFileUrl,
          detailed_report_file_url: detailedReportFileUrl,
          status: "completed",
        })
        .eq("id", processingId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("שגיאה ב-updateProcessingRecord:", error);
      return { data: null, error };
    }
  }

  // קבלת היסטוריית עיבודים של משתמש
  async getProcessingHistory(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from("contact_processing")
        .select("*")
        .eq("user_id", userId)
        .order("created_date", { ascending: false })
        .limit(limit);

      return { data, error };
    } catch (error) {
      console.error("שגיאה ב-getProcessingHistory:", error);
      return { data: null, error };
    }
  }

  // מחיקה לוגית של רשומת עיבוד
  async deleteProcessingRecord(processingId, userId) {
    try {
      const { data, error } = await supabase
        .from("contact_processing")
        .update({
          is_deleted: true,
          deletion_method: "user",
          deleted_at: new Date().toISOString(),
        })
        .eq("id", processingId)
        .eq("user_id", userId) // וידוא שהמשתמש בעל הרשומה
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("שגיאה ב-deleteProcessingRecord:", error);
      return { data: null, error };
    }
  }

  // העלאת קובץ לStorage
  async uploadFile(filePath, fileContent, contentType = "text/csv") {
    try {
      const { data, error } = await supabase.storage
        .from("processed-files")
        .upload(filePath, fileContent, {
          contentType,
          upsert: false, // לא לדרוס קבצים קיימים
        });

      if (error) {
        console.error("שגיאה באפלוד קובץ:", error);
        return { data: null, error };
      }

      // קבלת URL ציבורי לקובץ
      const { data: urlData } = supabase.storage
        .from("processed-files")
        .getPublicUrl(filePath);

      return {
        data: {
          path: data.path,
          fullPath: data.fullPath,
          publicUrl: urlData.publicUrl,
        },
        error: null,
      };
    } catch (error) {
      console.error("שגיאה ב-uploadFile:", error);
      return { data: null, error };
    }
  }

  // מחיקת קובץ מStorage
  async deleteFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from("processed-files")
        .remove([filePath]);

      return { data, error };
    } catch (error) {
      console.error("שגיאה ב-deleteFile:", error);
      return { data: null, error };
    }
  }

  // בדיקת תוקף קובץ (האם עבר 24 שעות)
  isFileExpired(expiresAt) {
    if (!expiresAt) return false;
    const now = new Date();
    const expiry = new Date(expiresAt);
    return now > expiry;
  }

  // מרק קבצים שפג תוקפם (להרצה ב-cron job)
  async cleanupExpiredFiles() {
    try {
      const { data: expiredRecords, error: fetchError } = await supabase
        .from("contact_processing")
        .select("id, processed_file_url, detailed_report_file_url")
        .lt("expires_at", new Date().toISOString())
        .eq("is_deleted", false);

      if (fetchError) {
        console.error("שגיאה בחיפוש קבצים שפג תוקפם:", fetchError);
        return { success: false, error: fetchError };
      }

      for (const record of expiredRecords || []) {
        // מחיקת קבצים מStorage
        if (record.processed_file_url) {
          const fileName = record.processed_file_url.split("/").pop();
          await this.deleteFile(fileName);
        }

        if (record.detailed_report_file_url) {
          const fileName = record.detailed_report_file_url.split("/").pop();
          await this.deleteFile(fileName);
        }

        // עדכון הרשומה כמחוקה
        await supabase
          .from("contact_processing")
          .update({
            is_deleted: true,
            deletion_method: "auto",
            deleted_at: new Date().toISOString(),
          })
          .eq("id", record.id);
      }

      return { success: true, cleanedCount: expiredRecords?.length || 0 };
    } catch (error) {
      console.error("שגיאה ב-cleanupExpiredFiles:", error);
      return { success: false, error };
    }
  }
}

module.exports = new SupabaseService();
