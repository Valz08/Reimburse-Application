import React, { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../utils/auth"; 
import axios from "axios";

export default function LoginUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg("Username dan Password wajib diisi!");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
        username,
        password,
        role: "user", // Kirim role agar backend tahu ini login user biasa
      });

      const user = res.data.user;
      const token = res.data.token;

      // Cegah login jika user ternyata admin


      // Simpan data user ke localStorage (atau global state jika pakai Redux/Context)
      localStorage.setItem("user", JSON.stringify(user));

      
// Simpan token dan user
saveToken(token); // simpan JWT token (ke localStorage)
sessionStorage.setItem("user", JSON.stringify(user)); // untuk PrivateRoute


      // Arahkan ke dashboard user
      navigate("/user/dashboard");
      } catch (err) {
          const status = err.response?.status;
          const msg =
            status === 429
              ? "Terlalu banyak percobaan login. Coba lagi dalam 1 menit."
              : err.response?.data?.message || "Terjadi kesalahan saat login.";
          setErrorMsg(msg);
        }
      };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-login.jpg')" }}
    >
      {/* KIRI */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/2 w-full flex flex-col justify-center items-center pl-19 text-white"
      >
        <motion.img
          src="/klaim.png"
          alt="Klaimee Logo"
          // style={{ width: "30rem" }}
          className="w-4/5 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain mx-auto md:mx-0 md:ml-0 ml-10"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        />
      </motion.div>

      {/* KANAN */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="md:w-1/2 w-full flex flex-col justify-center items-center p-8"
      >
        <div className="w-full max-w-md text-white">
          <div className="flex justify-center mb-6">
            <User className="w-10 h-10 text-blue-200" />
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center mb-4 bg-white/10 py-2 rounded"
            >
              {errorMsg}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleLogin}
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative">
              <User className="absolute left-3 top-3 text-blue-200" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-blue-200" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-blue-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition"
            >
              LOGIN
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
