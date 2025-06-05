import Layout from "./Layout.jsx";
import Upload from "./Upload.jsx";
import History from "./History";
import LandingPage from "./LandingPage";
import APISettingsPage from "./APISettingsPage";
import TruecallerSettingsPage from "./TruecallerSettingsPage";
import ProcessingDefaultsPage from "./ProcessingDefaultsPage";
import HistoryPage from "./HistoryPage";
import AuthPage from "./AuthPage.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

import { useState } from "react";

const PAGES = {
  Upload: Upload,
  History: History,
  LandingPage: LandingPage,
  APISettingsPage: APISettingsPage,
  TruecallerSettingsPage: TruecallerSettingsPage,
  ProcessingDefaultsPage: ProcessingDefaultsPage,
  HistoryPage: HistoryPage,
  AuthPage: AuthPage,
};

const _getCurrentPage = (pathname) => {
  const pageMappings = {
    "/": "LandingPage",
    "/auth": "AuthPage",
    "/upload": "Upload",
    "/history": "History",
    "/api-settings": "APISettingsPage",
    "/truecaller-settings": "TruecallerSettingsPage",
    "/processing-defaults": "ProcessingDefaultsPage",
  };
  return pageMappings[pathname] || "Upload";
};

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  // מודל זמני לאפשר בחירת דף בצורה דינמית
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  return (
    <Routes>
      {/* דף נחיתה ציבורי */}
      <Route
        path="/"
        element={
          <Layout currentPageName="LandingPage">
            <LandingPage />
          </Layout>
        }
      />

      {/* דף אימות ציבורי */}
      <Route
        path="/auth"
        element={
          <Layout currentPageName="AuthPage">
            <AuthPage />
          </Layout>
        }
      />

      {/* דפים מוגנים */}
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Upload">
              <Upload />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout currentPageName="History">
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/api-settings"
        element={
          <ProtectedRoute>
            <Layout currentPageName="APISettingsPage">
              <APISettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/truecaller-settings"
        element={
          <ProtectedRoute>
            <Layout currentPageName="TruecallerSettingsPage">
              <TruecallerSettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/processing-defaults"
        element={
          <ProtectedRoute>
            <Layout currentPageName="ProcessingDefaultsPage">
              <ProcessingDefaultsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* הפניות מדפים ישנים */}
      <Route path="/user" element={<Navigate to="/auth" replace />} />
      <Route path="/user/*" element={<Navigate to="/auth" replace />} />
      <Route
        path="/page/:pageName"
        element={<Navigate to="/upload" replace />}
      />

      {/* דף ברירת מחדל - הפניה לדף הנחיתה */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
