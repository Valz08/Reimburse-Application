import React, { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import axiosWithAuth from "../utils/axiosWithAuth"; // ✅ pakai ini

export default function DashboardUser() {
  const [reimbursements, setReimbursements] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const username = parsed.username;

    setUser(parsed);
    setReimbursements([]);

    axiosWithAuth
      .get(`/reimbursements?username=${username}`)
      .then((res) => setReimbursements(res.data))
      .catch((err) => console.error("Gagal fetch data reimburse", err));
  }, []);

  const menunggu = reimbursements.filter((r) => r.status === "menunggu");
  const disetujui = reimbursements.filter((r) => r.status === "disetujui");
  const ditolak = reimbursements.filter((r) => r.status === "ditolak");

  return (
    <main>
      {/* Ringkasan Kartu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} />
            <span className="text-sm">Sedang Diproses</span>
          </div>
          <p className="text-3xl font-bold mt-2">{menunggu.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-green-100 text-green-800 p-4 rounded-xl shadow"
        >
          <div className="flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="text-sm">Disetujui</span>
          </div>
          <p className="text-3xl font-bold mt-2">{disetujui.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-red-100 text-red-800 p-4 rounded-xl shadow"
        >
          <div className="flex items-center gap-3">
            <XCircle size={20} />
            <span className="text-sm">Ditolak</span>
          </div>
          <p className="text-3xl font-bold mt-2">{ditolak.length}</p>
        </motion.div>
      </div>

      {/* List Reimbursement Terbaru */}
      <div className="flex items-center gap-2 mb-3 text-[#16425B] font-semibold">
        <ClipboardList size={18} />
        <h3 className="text-lg">Reimbursement Terbaru (Menunggu)</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menunggu.length > 0 ? (
          menunggu.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-400"
            >
              <p className="font-semibold text-[#16425B]">{item.jenis}</p>
              <p className="text-sm text-gray-600">{item.tanggal_transaksi}</p>
              <p className="mt-2 text-sm">{item.keterangan}</p>
              <p className="mt-1 font-semibold text-blue-800">
                Rp {Number(item.nominal).toLocaleString("id-ID")}
              </p>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 text-sm col-span-full text-center">
            Belum ada pengajuan reimburse.
          </p>
        )}
      </div>
    </main>
  );
}
