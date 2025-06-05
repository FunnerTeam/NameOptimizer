export function createPageUrl(pageName: string) {
  // מיפוי ספציפי לדפים מוכרים
  const pageMapping: { [key: string]: string } = {
    Upload: "/upload",
    History: "/history",
    APISettingsPage: "/api-settings",
    TruecallerSettingsPage: "/truecaller-settings",
    ProcessingDefaultsPage: "/processing-defaults",
  };

  // אם יש מיפוי ספציפי, השתמש בו
  if (pageMapping[pageName]) {
    return pageMapping[pageName];
  }

  // אחרת, השתמש בלוגיקה הישנה
  return "/" + pageName.toLowerCase().replace(/ /g, "-");
}
