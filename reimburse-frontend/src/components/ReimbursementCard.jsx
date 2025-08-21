import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function ReimbursementCard({ data }) {
  const statusMap = {
    menunggu: {
      color: "from-yellow-100 to-yellow-50 border-yellow-400",
      badge: "bg-yellow-200/50 text-yellow-700",
      icon: <Clock className="text-yellow-600" size={18} />,
    },
    disetujui: {
      color: "from-green-100 to-green-50 border-green-400",
      badge: "bg-green-200/50 text-green-700",
      icon: <CheckCircle className="text-green-600" size={18} />,
    },
    ditolak: {
      color: "from-red-100 to-red-50 border-red-400",
      badge: "bg-red-200/50 text-red-700",
      icon: <XCircle className="text-red-600" size={18} />,
    },
  };

  const status = statusMap[data.status] || {};

  // ✅ Buat URL bukti hanya sekali
  const buktiUrl = data.bukti
    ? data.bukti.startsWith("http")
      ? data.bukti
      : `${import.meta.env.VITE_API_URL}/storage/${data.bukti}`
    : null;

  return (
    <div
      className={`rounded-2xl border-l-4 ${status.color} shadow-md bg-gradient-to-br p-6 transition hover:shadow-xl`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{data.jenis}</h3>
          <p className="text-sm text-gray-500">{data.tanggal_transaksi}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${status.badge}`}
        >
          {status.icon}
          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t my-3 border-gray-200" />

      {/* Info */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">Nominal</span>
          <span className="text-gray-800 font-semibold">
            Rp {Number(data.nominal).toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-500">Keterangan</span>
          <p className="text-gray-700 mt-1 break-words">
            {data.keterangan || "–"}
          </p>
        </div>

        {/* Bukti Gambar */}
        {buktiUrl && (
          <div className="pt-2">
            <span className="font-medium text-gray-500">Bukti</span>
            <a
              href={buktiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2"
            >
              <img
                src={buktiUrl}
                alt="Bukti"
                className="rounded-md border shadow-sm w-32 h-auto hover:scale-105 transition duration-300"
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
