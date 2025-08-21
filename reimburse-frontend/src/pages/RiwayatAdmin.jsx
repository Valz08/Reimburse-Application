import React, { useEffect, useState, useRef } from "react";
import axiosWithAuth from "../utils/axiosWithAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function RiwayatAdmin() {
  const [riwayat, setRiwayat] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);
  const itemsPerPage = 5;

  const [filters, setFilters] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    divisi: "",
    jenis: "",
    tanggalAwal: "",
    tanggalAkhir: "",
  });

  useEffect(() => {
    axiosWithAuth
      .get("/reimbursements/history/admin")
      .then((res) => {
        const fixed = res.data.map((item) => ({
          ...item,
          bukti: item.bukti?.startsWith("http")
            ? item.bukti
            : item.bukti
            ? `${import.meta.env.VITE_API_URL}/storage/${item.bukti}`
            : null,
        }));
        setRiwayat(fixed);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csv_file", file);

    try {
      await axiosWithAuth.post("/reimbursements/import/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Berhasil import CSV!", { duration: 3000 });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast.error("❌ Gagal import CSV. Cek format dan coba lagi.");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axiosWithAuth.get("/reimbursements/export/csv", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "riwayat-reimburse.csv";
      a.click();

      window.URL.revokeObjectURL(url);
      toast.success("✅ Berhasil export CSV!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Gagal export CSV");
    }
  };

  const filteredData = riwayat.filter((item) => {
    return (
      (!filters.nama || item.user_name?.toLowerCase().includes(filters.nama.toLowerCase())) &&
      (!filters.nip || item.nip?.toLowerCase().includes(filters.nip.toLowerCase())) &&
      (!filters.jabatan || item.jabatan?.toLowerCase().includes(filters.jabatan.toLowerCase())) &&
      (!filters.divisi || item.divisi?.toLowerCase().includes(filters.divisi.toLowerCase())) &&
      (!filters.jenis || item.jenis?.toLowerCase().includes(filters.jenis.toLowerCase())) &&
      (!filters.tanggalAwal || new Date(item.tanggal_transaksi) >= new Date(filters.tanggalAwal)) &&
      (!filters.tanggalAkhir || new Date(item.tanggal_transaksi) <= new Date(filters.tanggalAkhir))
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className="p-4 sm:p-6 bg-[#F5F8FF] min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-[#16425B]">Riwayat Reimburse</h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            Export CSV
          </button>

          <label className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow cursor-pointer transition">
            Upload CSV
            <input type="file" accept=".csv" hidden onChange={handleUploadCSV} />
          </label>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-white border text-[#16425B] hover:bg-gray-50 shadow"
            >
              <Filter size={16} />
              Filter
            </button>

            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white p-4 rounded-xl shadow-xl border z-50"
                >
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {["nama", "nip", "jabatan", "divisi", "jenis"].map((key) => (
                      <input
                        key={key}
                        type="text"
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        className="p-2 border rounded"
                        value={filters[key]}
                        onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                      />
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="p-2 border rounded w-full"
                        value={filters.tanggalAwal}
                        onChange={(e) => setFilters({ ...filters, tanggalAwal: e.target.value })}
                      />
                      <input
                        type="date"
                        className="p-2 border rounded w-full"
                        value={filters.tanggalAkhir}
                        onChange={(e) => setFilters({ ...filters, tanggalAkhir: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border overflow-x-auto transition">
        <table className="min-w-[900px] w-full text-sm text-left">
          <thead className="bg-[#E6EFFB] text-[#16425B] text-xs uppercase font-semibold">
            <tr>
              {["Nama", "NIP", "Jabatan", "Divisi", "Jenis", "Tanggal", "Nominal", "Bukti", "Status"].map((head, i) => (
                <th key={i} className="px-4 py-3 whitespace-nowrap">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-6 text-center text-gray-500 italic">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {paginatedData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-t hover:bg-[#eaf4ff] transition"
                  >
                    <td className="px-4 py-3">{item.user_name}</td>
                    <td className="px-4 py-3">{item.nip}</td>
                    <td className="px-4 py-3">{item.jabatan}</td>
                    <td className="px-4 py-3">{item.divisi}</td>
                    <td className="px-4 py-3">{item.jenis}</td>
                    <td className="px-4 py-3">{item.tanggal_transaksi}</td>
                    <td className="px-4 py-3">Rp {parseInt(item.nominal).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3">
                      {item.bukti ? (
                        <a href={item.bukti} target="_blank" rel="noopener noreferrer">
                          <img
                            src={item.bukti}
                            alt="Bukti"
                            className="w-10 h-10 object-cover rounded border hover:scale-105 transition"
                          />
                        </a>
                      ) : (
                        <span className="italic text-gray-400">Tidak Ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold capitalize">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          item.status === "disetujui"
                            ? "bg-green-100 text-green-700"
                            : item.status === "ditolak"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setCurrentPage(i + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              whileTap={{ scale: 0.95 }}
              className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-blue-600 hover:bg-blue-100"
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>
      )}
    </main>
  );
}
