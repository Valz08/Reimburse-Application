import React, { useEffect, useState } from "react";
import axiosWithAuth from "../utils/axiosWithAuth";
import {
  Clock,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  FileImage,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    total: 0,
    menunggu: 0,
    disetujui: 0,
    ditolak: 0,
  });

  const [recent, setRecent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const fetchData = () => {
    axiosWithAuth.get("/reimbursements/stats").then((res) => {
      setStats(res.data);
    });

    axiosWithAuth.get("/reimbursements/pending/admin").then((res) => {
      const fixed = res.data.map((item) => ({
        ...item,
        bukti: item.bukti
          ? item.bukti.startsWith("http")
            ? item.bukti
            : `${import.meta.env.VITE_API_URL}/storage/${item.bukti}`
          : null,
      }));
      setRecent(fixed);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmAction = async () => {
    try {
      const { id, status } = selectedAction;
      await axiosWithAuth.put(`/reimbursements/${id}`, { status });
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error("Gagal update status:", error);
      alert("Gagal mengubah status");
    }
  };

  const paginatedData = recent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(recent.length / itemsPerPage);

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <LayoutDashboard size={28} className="text-blue-700" />
        <h2 className="text-2xl font-bold text-[#16425B]">Dashboard Admin</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow">
          <h3 className="text-sm mb-1 font-medium">Total Reimburse</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span className="text-sm">Menunggu</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.menunggu}</p>
        </motion.div>
        <motion.div className="bg-green-100 text-green-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span className="text-sm">Disetujui</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.disetujui}</p>
        </motion.div>
        <motion.div className="bg-red-100 text-red-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2">
            <XCircle size={18} />
            <span className="text-sm">Ditolak</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.ditolak}</p>
        </motion.div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-[#16425B]">
          Daftar Reimburse Menunggu Persetujuan
        </h3>
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700 uppercase text-xs">
              <th className="p-3">Nama</th>
              <th className="p-3">NIP</th>
              <th className="p-3">Jabatan</th>
              <th className="p-3">Divisi</th>
              <th className="p-3">Jenis</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Nominal</th>
              <th className="p-3">Keterangan</th>
              <th className="p-3">Bukti</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="11" className="p-4 text-center text-gray-500">
                  Tidak ada data.
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
                    transition={{ delay: index * 0.04 }}
                    className="border-b hover:bg-blue-50 transition-all text-gray-700"
                  >
                    <td className="p-3">{item.user_name}</td>
                    <td className="p-3">{item.nip}</td>
                    <td className="p-3">{item.jabatan}</td>
                    <td className="p-3">{item.divisi}</td>
                    <td className="p-3">{item.jenis}</td>
                    <td className="p-3">{item.tanggal_transaksi}</td>
                    <td className="p-3">
                      Rp {parseInt(item.nominal).toLocaleString("id-ID")}
                    </td>
                    <td className="p-3">{item.keterangan}</td>
                    <td className="p-3">
                      {item.bukti ? (
                        <a
                          href={item.bukti}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={item.bukti}
                            alt="Bukti"
                            className="w-14 h-14 object-cover rounded-lg border hover:scale-105 transition"
                          />
                        </a>
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center border rounded-lg bg-slate-100 text-slate-500">
                          <FileImage className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 capitalize font-semibold text-yellow-600">
                      {item.status}
                    </td>
                    <td className="p-3 space-y-2 flex flex-col">
                      <button
                        onClick={() => {
                          setSelectedAction({ id: item.id, status: "disetujui" });
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAction({ id: item.id, status: "ditolak" });
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentPage(i + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-3 py-1 text-sm rounded-full border shadow transition-all duration-200 ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold mb-2 text-[#16425B]">
              Konfirmasi
            </h3>
            <p className="text-sm mb-4 text-gray-700">
              Apakah Anda yakin ingin{" "}
              <span className="font-bold capitalize text-blue-600">
                {selectedAction?.status}
              </span>{" "}
              pengajuan ini?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-sm text-white rounded transition ${
                  selectedAction?.status === "disetujui"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Konfirmasi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
