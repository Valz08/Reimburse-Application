import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { motion, AnimatePresence } from "framer-motion";
import useAutoLogout from "../hooks/useAutoLogout";

export default function DashboardAdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useAutoLogout(17);// set auto logout 17 menit

  // Update isMobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <div
        className={`hidden md:block fixed top-0 left-0 z-40 h-full bg-white shadow transition-all duration-300 ease-in-out 
        ${collapsed ? "w-[80px]" : "w-[260px]"}`}
      >
        <SidebarAdmin
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
          <SidebarAdmin
            collapsed={false}
            setCollapsed={setCollapsed}
            isMobile={true}
          />
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-col w-full h-full transition-all duration-300 ease-in-out
        ${collapsed ? "md:ml-[80px]" : "md:ml-[260px]"} ml-0`}
      >
        {/* Header */}
        <div className="sticky top-0 z-30">
          <HeaderAdmin setMobileSidebarOpen={setMobileSidebarOpen} />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto p-4 md:p-6"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
