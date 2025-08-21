import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosWithAuth from "../utils/axiosWithAuth";

export default function HeaderAdmin({ setMobileSidebarOpen }) {
  const location = useLocation();
  const dropdownRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axiosWithAuth.get("/reimbursements/notifications/unread?user_name=admin");
      setNotifications(res.data);
    } catch (err) {
      console.error("Gagal ambil notifikasi admin:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        if (notifications.length > 0) markAllAsRead();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications([]);
    axiosWithAuth
      .post("/reimbursements/notifications/mark-read?user_name=admin")
      .catch((err) => console.error("Gagal tandai dibaca", err));
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTitle = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return "Selamat datang Admin 👋";
      case "/admin/riwayat":
        return "Riwayat Pengajuan";
      default:
        return "";
    }
  };

  const getSubheading = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return "Pantau dan kelola pengajuan reimburse dari seluruh user.";
      case "/admin/riwayat":
        return "Lihat semua riwayat reimburse yang sudah diproses.";
      default:
        return "";
    }
  };

  const handleNotifClick = () => {
    setShowDropdown(false);
    if (notifications.length > 0) markAllAsRead();
  };

  return (
    <header className="w-full px-4 sm:px-6 py-4 bg-white shadow flex items-center justify-between sticky top-0 z-50">
      {/* Judul */}
      <div className="flex flex-col gap-1">
        <motion.h2
          key="title"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-semibold text-[#16425B]"
        >
          {getTitle()}
        </motion.h2>
        <motion.p
          key="subheading"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
          className="text-sm text-gray-500"
        >
          {getSubheading()}
        </motion.p>
      </div>

      {/* Area kanan */}
      <div className="flex items-center gap-6 relative" ref={dropdownRef}>
        {setMobileSidebarOpen && (
          <button
            className="md:hidden p-1 rounded text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Bell Notifikasi */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative group"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          <Bell className="text-gray-600" size={20} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {notifications.length}
            </span>
          )}
          <span className="absolute hidden group-hover:block -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded shadow">
            Notifikasi
          </span>
        </motion.button>

        {/* Dropdown Notifikasi */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border z-50"
            >
              <div className="p-3 font-semibold border-b text-gray-700">Notifikasi</div>

              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">Semua notifikasi telah dibaca.</div>
              ) : (
                <ul className="max-h-60 overflow-y-auto divide-y">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      onClick={handleNotifClick}
                      className="px-4 py-3 text-sm flex items-start gap-2 cursor-pointer hover:bg-gray-50 transition"
                    >
                      {/* Icon status */}
                      {notif.status === "disetujui" && (
                        <CheckCircle size={16} className="mt-0.5 text-green-500" />
                      )}
                      {notif.status === "ditolak" && (
                        <XCircle size={16} className="mt-0.5 text-red-500" />
                      )}
                      {notif.status === "menunggu" && (
                        <Clock size={16} className="mt-0.5 text-yellow-500" />
                      )}

                      {/* Isi notifikasi */}
                      <span className="leading-snug">
                        <strong>{notif.user?.username ?? "User"}</strong> mengajukan{" "}
                        <strong>{notif.jenis ?? "Reimburse"}</strong>{" "}
                        (<span className="capitalize">{notif.status ?? "menunggu"}</span>)<br />
                        <span className="text-xs text-gray-500">{formatDate(notif.created_at)}</span>
                      </span>

                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Admin */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow cursor-pointer"
        >
          A
        </motion.div>
      </div>
    </header>
  );
}
