import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import ReimbursementCard from "../components/ReimbursementCard";
import axiosWithAuth from "../utils/axiosWithAuth"; // ✅ pakai axiosWithAuth

export default function Riwayat() {
  const [reimbursements, setReimbursements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const itemsPerPage = 6;

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.username || "";

  useEffect(() => {
    if (!userName) return;

    axiosWithAuth
      .get(`/reimbursements/history/user?user_name=${encodeURIComponent(userName)}`)
      .then((res) => setReimbursements(res.data))
      .catch((err) =>
        console.error("Gagal mengambil data riwayat user:", err)
      );
  }, [userName]);

  const filtered = reimbursements
    .filter((item) => item.status === "disetujui" || item.status === "ditolak")
    .filter((item) =>
      searchKeyword.trim() === ""
        ? true
        : JSON.stringify(item).toLowerCase().includes(searchKeyword.toLowerCase())
    );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
    }),
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-50">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-wide text-[#16425B]">
          Riwayat Reimbursement
        </h2>
        <p className="text-sm text-[#3A7CA5] mt-1">
          Berikut adalah daftar reimburse yang sudah{" "}
          <span className="font-semibold">disetujui</span> atau{" "}
          <span className="font-semibold">ditolak</span>.
        </p>
      </div>

      <div className="mb-6 max-w-md">
        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md shadow-sm">
          <Search className="text-gray-500 mr-2" size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan jenis, status, atau lainnya..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent outline-none w-full text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            {paginated.length > 0 ? (
              paginated.map((item) => (
                <ReimbursementCard key={item.id} data={item} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                Tidak ada data yang cocok.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-3 mb-12 my-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const dir = i + 1 > currentPage ? 1 : -1;
                setDirection(dir);
                setCurrentPage(i + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-200 border shadow-sm ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
