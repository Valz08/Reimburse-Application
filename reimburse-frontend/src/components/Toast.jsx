// src/components/Toast.jsx
import React from "react";
import { motion } from "framer-motion";

const typeStyles = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

export default function Toast({ message, type = "info" }) {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -30, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-6 right-6 z-50 text-white px-4 py-3 rounded-md shadow-lg ${typeStyles[type]}`}
    >
      {message}
    </motion.div>
  );
}
