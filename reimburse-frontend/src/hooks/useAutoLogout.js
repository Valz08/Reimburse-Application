import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../utils/auth";

export default function useAutoLogout(timeoutMinutes = 15) {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const logout = () => {
    clearToken();
    sessionStorage.clear();
    navigate("/RoleSelection"); // atau "/login-admin" bisa diatur sesuai role
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, timeoutMinutes * 60 * 1000); // default 15 menit
  };

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // mulai timer pertama kali

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timerRef.current);
    };
  }, []);
}
