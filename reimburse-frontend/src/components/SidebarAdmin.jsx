import React from "react";
import { LayoutDashboard, FileText, LogOut, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { name: "Riwayat", icon: FileText, to: "/admin/riwayat" },
];

export default function SidebarAdmin({ collapsed, setCollapsed, isMobile = false }) {
  const location = useLocation();

  const sidebarWidth = isMobile ? "w-64" : collapsed ? "w-20" : "w-64";

  return (
    <aside
      className={`bg-gradient-to-b from-blue-800 to-blue-600 text-white h-screen flex flex-col shadow-lg transition-all duration-300 fixed md:static z-50 ${sidebarWidth}`}
    >
      {/* Logo & Collapse (hide toggle on mobile) */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-blue-700">
        {!collapsed && <h1 className="text-lg font-bold tracking-wide">Klaimee</h1>}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-blue-700 transition"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Menu Navigation */}
      <nav className="flex flex-col gap-1 px-2 mt-2">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={idx}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"
              }`}
            >
              <Icon size={20} />
              {!collapsed && (
                <span className="text-sm whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout & Copyright */}
      <div className="mt-auto px-4 py-4 border-t border-blue-700">
        <Link
          to="/RoleSelection"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </Link>

        {!collapsed && (
          <p className="text-[11px] text-gray-300 mt-4 text-center">
            © {new Date().getFullYear()} Klaimee
          </p>
        )}
      </div>
    </aside>
  );
}
