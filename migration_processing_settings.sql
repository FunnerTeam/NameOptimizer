-- הגדרת טבלת הגדרות עיבוד
CREATE TABLE IF NOT EXISTS processing_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  truecaller_usage TEXT DEFAULT 'never' CHECK (truecaller_usage IN ('never', 'if_name_missing', 'always_enrich')),
  truecaller_name_field TEXT DEFAULT 'שם מ-Truecaller',
  name_title_handling TEXT DEFAULT 'separate_field' CHECK (name_title_handling IN ('remove', 'prefix_firstname', 'separate_field')),
  gender_assignment BOOLEAN DEFAULT true,
  variation_handling TEXT DEFAULT 'standardize_add_note' CHECK (variation_handling IN ('standardize_add_note', 'keep_original')),
  phone_format_preference TEXT DEFAULT 'with_hyphen' CHECK (phone_format_preference IN ('with_hyphen', 'digits_only')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- אינדקס לחיפוש מהיר לפי משתמש
CREATE INDEX IF NOT EXISTS idx_processing_settings_user_id ON processing_settings(user_id);

-- RLS policies
ALTER TABLE processing_settings ENABLE ROW LEVEL SECURITY;

-- Policy: משתמשים יכולים לראות רק את ההגדרות שלהם
CREATE POLICY processing_settings_select_own 
ON processing_settings FOR SELECT 
USING (auth.uid()::text = user_id);

-- Policy: משתמשים יכולים לעדכן רק את ההגדרות שלהם  
CREATE POLICY processing_settings_update_own 
ON processing_settings FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Policy: משתמשים יכולים להוסיף רק הגדרות עבור עצמם
CREATE POLICY processing_settings_insert_own 
ON processing_settings FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Policy: משתמשים יכולים למחוק רק את ההגדרות שלהם
CREATE POLICY processing_settings_delete_own 
ON processing_settings FOR DELETE 
USING (auth.uid()::text = user_id);

-- Function לעדכון updated_at אוטומטי
CREATE OR REPLACE FUNCTION update_processing_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger לעדכון updated_at
CREATE TRIGGER processing_settings_updated_at
  BEFORE UPDATE ON processing_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_processing_settings_updated_at(); 