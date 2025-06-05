import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles,
  Upload,
  History,
  KeyRound,
  Settings,
  Database,
  Users,
  ChevronDown,
  ChevronUp,
  PhoneForwarded,
  FileText,
  Settings2,
  LogOut,
  User,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import PropTypes from "prop-types";

// SubMenu Component
const SubMenu = ({ title, icon: Icon, children, isOpen, onToggle }) => {
  return (
    <div>
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center px-3 py-2 text-base text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-md"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          {title}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 mt-1 space-y-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

SubMenu.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

// NavLink Component
const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === createPageUrl(to);
  return (
    <Link
      to={createPageUrl(to)}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
        isActive
          ? "bg-teal-600 text-white shadow-md"
          : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );
};

NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  children: PropTypes.node.isRequired,
};

export default function Layout({ children, currentPageName }) {
  const [openMenu, setOpenMenu] = useState(null);
  const { user, logout } = useAuth();

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // פשוט יותר - בדיקה אם זה דף הנחיתה
  const isLandingPage = currentPageName === "LandingPage";

  if (isLandingPage) {
    return (
      <>
        {children}
        <Toaster richColors position="bottom-right" />
      </>
    );
  }

  const menuItems = [
    { name: "ראשי", type: "header" },
    { name: "Upload", title: "העלאת קובץ", icon: Upload, type: "link" },
    {
      name: "History",
      title: "היסטוריית עיבודים",
      icon: History,
      type: "link",
    },
    {
      name: "אינטגרציות",
      type: "submenu",
      icon: Settings2,
      subItems: [
        {
          name: "APISettingsPage",
          title: "הגדרות API",
          icon: KeyRound,
          type: "link",
        },
        {
          name: "TruecallerSettingsPage",
          title: "Truecaller",
          icon: PhoneForwarded,
          type: "link",
        },
      ],
    },
    {
      name: "הגדרות",
      type: "submenu",
      icon: Settings,
      subItems: [
        {
          name: "ProcessingDefaultsPage",
          title: "הגדרות עיבוד",
          icon: Settings,
          type: "link",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <style>
        {`
          :root {
            --primary-color: #0f766e;
            --secondary-color: #0ea5e9;
            --accent-color: #10b981;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --shadow-color: rgba(15, 118, 110, 0.1); 
          }
          body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; background-color: #f8fafc; }
          .glass-effect { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.18); }
          .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .hover-lift:hover { transform: translateY(-1px); box-shadow: 0 4px 12px var(--shadow-color); }
        `}
      </style>

      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to={createPageUrl("Upload")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">שמטוב</h1>
            </Link>

            {/* פרטי משתמש וכפתור התנתקות */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-lg">
                  <User className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700">
                    {user.name}
                  </span>
                  <span className="text-xs text-teal-500">({user.email})</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  התנתק
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-64 bg-white border-l border-slate-200 p-4 space-y-2 shadow-lg">
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              if (item.type === "header") {
                return (
                  <h2
                    key={index}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  >
                    {item.name}
                  </h2>
                );
              }
              if (item.type === "link") {
                return (
                  <NavLink key={index} to={item.name} icon={item.icon}>
                    {item.title}
                  </NavLink>
                );
              }
              if (item.type === "submenu" && item.subItems) {
                return (
                  <SubMenu
                    key={index}
                    title={item.name}
                    icon={item.icon}
                    isOpen={openMenu === item.name}
                    onToggle={() => toggleMenu(item.name)}
                  >
                    {item.subItems.map((subItem, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={subItem.name}
                        icon={subItem.icon}
                      >
                        {subItem.title}
                      </NavLink>
                    ))}
                  </SubMenu>
                );
              }
              return null;
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  currentPageName: PropTypes.string.isRequired,
};
