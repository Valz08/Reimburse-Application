import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axiosWithAuth from "../utils/axiosWithAuth";

export default function HeaderUser({ setMobileSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!user?.username) return;
    axiosWithAuth
      .get(`/reimbursements/notifications/unread?user_name=${user.username}`)
      .then((res) => setNotifications(res.data))
      .catch(() => toast.error("Gagal mengambil notifikasi."));
  }, [user]);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowNotifDropdown(false);
        setShowUserDropdown(false);
        if (notifications.length > 0 && user?.username) markAllAsRead();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifications, user]);

  const markAllAsRead = () => {
    setLoading(true);
    axiosWithAuth
      .post("/reimbursements/notifications/mark-read", { user_name: user.username })
      .then(() => setNotifications([]))
      .catch(() => toast.error("Gagal tandai notifikasi dibaca."))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login-user");
  };

  const getTitle = () => {
    switch (location.pathname) {
      case "/user/dashboard":
        return `Selamat datang kembali, ${user?.username || "User"} 👋`;
      case "/user/ajukan":
        return "Ajukan Reimburse";
      case "/user/riwayat":
        return "Riwayat Reimburse";
      default:
        return "";
    }
  };

  const getSubheading = () => {
    switch (location.pathname) {
      case "/user/dashboard":
        return `Tetap semangat ajukan reimburse, ${user?.username || "User"}! 💼`;
      case "/user/ajukan":
        return "Pastikan data lengkap sebelum kirim ya!";
      case "/user/riwayat":
        return "Lihat riwayat reimburse kamu di sini.";
      default:
        return "";
    }
  };

  return (
    <header className="w-full px-4 sm:px-6 py-4 bg-white shadow flex items-center justify-between sticky top-0 z-50" ref={dropdownRef}>
      {/* Judul dan Subjudul */}
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

      {/* Notifikasi & Avatar */}
      <div className="flex items-center gap-6 relative">
        {/* Tombol sidebar mobile */}
        {setMobileSidebarOpen && (
          <button
            className="md:hidden p-1 rounded text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Notifikasi */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative group"
          onClick={() => setShowNotifDropdown((v) => !v)}
          aria-label="Toggle notifications"
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

        <AnimatePresence>
          {showNotifDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-xl border z-50"
            >
              <div className="p-3 font-semibold border-b text-gray-700 flex justify-between items-center">
                Notifikasi
                {loading && (
                  <span className="text-xs text-gray-400 italic">Memproses...</span>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">Tidak ada notifikasi baru</div>
              ) : (
                <ul className="max-h-60 overflow-y-auto divide-y">
                  {notifications.map((notif) => (
                    <li
                      key={notif.id}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        markAllAsRead();
                      }}
                      className="px-4 py-3 text-sm flex items-start gap-2 cursor-pointer hover:bg-gray-50 transition"
                    >
                      {notif.status === "disetujui" ? (
                        <CheckCircle size={16} className="mt-0.5 text-green-500" />
                      ) : (
                        <XCircle size={16} className="mt-0.5 text-red-500" />
                      )}
                      <span className="leading-snug">
                        <strong>{notif.jenis || "Reimbursement"}</strong> kamu telah{" "}
                        <span className="font-semibold capitalize">{notif.status}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow cursor-pointer select-none"
            onClick={() => setShowUserDropdown((v) => !v)}
            aria-label="User menu"
          >
            {user?.username?.[0]?.toUpperCase() || "U"}
          </motion.div>

          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-12 w-48 bg-white rounded-lg shadow-xl border z-50"
              >
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-100 rounded-b-lg transition"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
