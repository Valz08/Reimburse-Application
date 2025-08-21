import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-login.jpg')" }}
    >
      {/* KIRI - Logo Klaimee */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/2 w-full flex flex-col justify-center items-center"
      >
        <motion.img
          src="/klaim.png"
          alt="Klaimee Logo"
          className="w-4/5 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain mx-auto md:mx-0"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </motion.div>

      {/* KANAN - Pilihan Role */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 text-white"
      >
        <div className="w-full max-w-md text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white drop-shadow-md"
          >
            
          </motion.h2>

          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Tombol User */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login-user")}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl shadow-lg hover:shadow-blue-500/40"
            >
              <User size={20} />
              <span className="font-medium">Login sebagai User</span>
            </motion.button>

            {/* Tombol Admin */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login-admin")}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-700 hover:bg-gray-800 transition text-white rounded-xl shadow-lg hover:shadow-gray-400/40"
            >
              <ShieldCheck size={20} />
              <span className="font-medium">Login sebagai Admin</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
