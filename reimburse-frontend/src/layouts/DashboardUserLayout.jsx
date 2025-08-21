import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarUser from "../components/SidebarUser";
import HeaderUser from "../components/HeaderUser";
import { motion, AnimatePresence } from "framer-motion";
import useAutoLogout from "../hooks/useAutoLogout";

export default function DashboardUserLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useAutoLogout(17);//set auto logout 17 menit

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <div
        className={`hidden md:block fixed top-0 left-0 z-40 h-full bg-white shadow transition-all duration-300 ease-in-out 
        ${collapsed ? "w-[80px]" : "w-[260px]"}`}
      >
        <SidebarUser
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={false}
        />
      </div>

      {/* Sidebar Mobile */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${
          mobileSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <div
          className="absolute top-0 left-0 h-full w-[260px] bg-white shadow"
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarUser
            collapsed={false}
            setCollapsed={setCollapsed}
            isMobile={true}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col w-full h-full transition-all duration-300 ease-in-out
        ${collapsed ? "md:ml-[80px]" : "md:ml-[260px]"} z-0`}
      >
        {/* Header */}
        <div className="sticky top-0 z-30">
          <HeaderUser setMobileSidebarOpen={setMobileSidebarOpen} />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto p-4 md:p-6 relative z-0"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
