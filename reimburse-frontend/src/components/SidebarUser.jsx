import React from "react";
import { clearToken } from "../utils/auth";
import {
  LayoutDashboard,
  FileText,
  Menu,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/user/dashboard" },
  { name: "Ajukan Reimburse", icon: <PlusCircle size={20} />, to: "/user/ajukan" },
  { name: "Riwayat", icon: <FileText size={20} />, to: "/user/riwayat" },
];

export default function SidebarUser({ collapsed, setCollapsed, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/Roleselection");
  };

  return (
    <aside
      className={`bg-gradient-to-b from-blue-800 to-blue-600 text-white h-full shadow-lg transition-all duration-300 z-50
        ${collapsed ? "w-20" : "w-64"} ${isMobile ? "fixed" : ""}`}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo dan Toggle */}
        <div className="flex items-center justify-between mb-10">
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-wide">Klaimee</h1>
          )}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded hover:bg-blue-700 transition"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="flex flex-col space-y-2 flex-grow">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={idx}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                  ${isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`}
              >
                <div className="shrink-0">{item.icon}</div>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout dan Footer */}
        <div className="pt-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition w-full text-left"
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>

          {!collapsed && (
            <p className="text-xs text-blue-200 text-center mt-4">
              © {new Date().getFullYear()} Klaimee
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
