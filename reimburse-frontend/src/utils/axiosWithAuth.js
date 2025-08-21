// src/utils/axiosWithAuth.js
import axios from "axios";

const axiosWithAuth = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptor untuk menyisipkan token di setiap request
axiosWithAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosWithAuth;
