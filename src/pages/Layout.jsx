import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Sparkles,
  Upload,
  History,
  KeyRound,
  Settings,
  ChevronDown,
  ChevronUp,
  PhoneForwarded,
  Settings2,
  LogOut,
  User,
  ChevronRight,
  ChevronLeft,
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
        className="w-full flex justify-between items-center px-3 py-3 text-base text-indigo-700 hover:bg-white/50 hover:text-indigo-800 rounded-xl backdrop-blur-sm border border-white/20 shadow-sm transition-all duration-200"
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
            className="ml-4 mt-2 space-y-1 overflow-hidden"
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
      className={`flex items-center gap-3 px-3 py-3 text-base rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md ${
        isActive
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
          : "text-indigo-700 hover:bg-white/50 hover:text-indigo-800"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {children && <span className="truncate">{children}</span>}
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      name: "ProcessingDefaultsPage",
      title: "הגדרות עיבוד",
      icon: Settings,
      type: "link",
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

      <header className="bg-gradient-to-l from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-200/50 shadow-lg backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to={createPageUrl("Upload")}
              className="flex items-center gap-3 hover:opacity-80 transition-all duration-200 hover:scale-105"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                שמטוב
              </h1>
            </Link>

            {/* פרטי משתמש וכפתור התנתקות */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-indigo-200/50 shadow-md">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-indigo-700">
                      {user.name}
                    </span>
                    <span className="text-xs text-indigo-500">
                      {user.email}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50/80 backdrop-blur-sm border border-transparent hover:border-red-200 rounded-xl transition-all duration-200"
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
        <aside
          className={`${
            sidebarCollapsed ? "w-16" : "w-64"
          } transition-all duration-300 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 border-l border-indigo-200 shadow-2xl relative`}
        >
          {/* כפתור צמצם/הרחב */}
          <Button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant="ghost"
            size="sm"
            className="absolute -left-3 top-4 z-10 bg-white border border-indigo-200 rounded-full w-6 h-6 p-0 shadow-md hover:shadow-lg transition-all duration-200"
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="w-3 h-3 text-indigo-600" />
            ) : (
              <ChevronRight className="w-3 h-3 text-indigo-600" />
            )}
          </Button>

          <div className={`${sidebarCollapsed ? "p-2" : "p-4"} space-y-2`}>
            <nav className="space-y-2">
              {menuItems.map((item, index) => {
                if (item.type === "header") {
                  return (
                    <h2
                      key={index}
                      className={`px-3 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider transition-opacity ${
                        sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"
                      }`}
                    >
                      {item.name}
                    </h2>
                  );
                }
                if (item.type === "link") {
                  return (
                    <div key={index} className="relative group">
                      {sidebarCollapsed ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-12 h-12 p-0 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm text-indigo-700 hover:bg-white/50 hover:text-indigo-800 hover:shadow-md transition-all duration-200 mx-auto flex items-center justify-center"
                          asChild
                        >
                          <Link to={createPageUrl(item.name)}>
                            <item.icon className="w-5 h-5" />
                          </Link>
                        </Button>
                      ) : (
                        <NavLink to={item.name} icon={item.icon}>
                          {item.title}
                        </NavLink>
                      )}
                      {sidebarCollapsed && (
                        <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                          {item.title}
                        </div>
                      )}
                    </div>
                  );
                }
                if (
                  item.type === "submenu" &&
                  item.subItems &&
                  !sidebarCollapsed
                ) {
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
                if (
                  item.type === "submenu" &&
                  item.subItems &&
                  sidebarCollapsed
                ) {
                  // בתצוגה מצומצמת - רק האייקון הראשי עם טולטיפ
                  return (
                    <div key={index} className="relative group">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-12 h-12 p-0 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm text-indigo-700 hover:bg-white/50 hover:text-indigo-800 hover:shadow-md transition-all duration-200 mx-auto flex items-center justify-center"
                      >
                        <item.icon className="w-5 h-5" />
                      </Button>
                      <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {item.name}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
