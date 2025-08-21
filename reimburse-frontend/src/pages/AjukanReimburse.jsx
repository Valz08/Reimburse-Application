import React, { useState, useEffect } from "react";
import axiosWithAuth from "../utils/axiosWithAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Calendar,
  FileText,
  ClipboardEdit,
  Briefcase,
  Building2,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AjukanReimburse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    user_name: "",
    nip: "",
    jabatan: "",
    divisi: "",
    jenis: "",
    tanggal_transaksi: new Date(),
    nominal: "",
    keterangan: "",
    file_bukti: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const username = parsed.username || "";

      setForm((prev) => ({
        ...prev,
        user_name: username,
      }));

      // Ambil data profil dari backend
      axiosWithAuth.get(`/profile/${username}`)
        .then((res) => {
          setForm((prev) => ({
            ...prev,
            nip: res.data.nip || "",
            jabatan: res.data.jabatan || "",
            divisi: res.data.divisi || "",
          }));
        })
        .catch((err) => {
          console.error("Gagal ambil data profil:", err);
        });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    const formattedDate = form.tanggal_transaksi.toISOString().split("T")[0];

    for (const key in form) {
      if (key === "file_bukti" && !form[key]) continue;
      if (key === "tanggal_transaksi") {
        data.append(key, formattedDate);
      } else {
        data.append(key, form[key]);
      }
    }

    try {
      await axiosWithAuth.post("/reimbursements", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(" Reimburse berhasil diajukan!", {
        style: {
          borderRadius: "8px",
          background: "#16425B",
          color: "#fff",
        },
      });

      setTimeout(() => navigate("/user/dashboard"), 2000);
    } catch (err) {
      console.error("Gagal mengajukan:", err.response?.data || err);
      toast.error(err.response?.data?.message || "❌ Gagal ajukan reimburse", {
        style: {
          borderRadius: "8px",
          background: "#fff",
          color: "#ff4d4f",
          border: "1px solid #ff4d4f",
        },
        icon: "⚠️",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#f8f9fb] p-4 sm:p-10"
    >
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#16425B] mb-8 flex items-center gap-2">
          <ClipboardEdit size={26} /> Ajukan Reimburse
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white w-full overflow-hidden px-6 sm:px-10 py-10 rounded-xl shadow space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <InputField
              icon={<FileText size={18} />}
              label="NIP / ID Karyawan"
              name="nip"
              value={form.nip}
              onChange={handleChange}
              disabled
            />
            <InputField
              icon={<Briefcase size={18} />}
              label="Jabatan"
              name="jabatan"
              value={form.jabatan}
              onChange={handleChange}
              disabled
            />
            <InputField
              icon={<Building2 size={18} />}
              label="Divisi"
              name="divisi"
              value={form.divisi}
              onChange={handleChange}
              disabled
            />
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                Jenis Reimburse
              </label>
              <select
                name="jenis"
                value={form.jenis}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:outline-none focus:border-[#16425B] transition"
              >
                <option value="">-- Pilih --</option>
                <option value="Transportasi">Transportasi</option>
                <option value="Konsumsi">Konsumsi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={16} /> Tanggal Transaksi
                </span>
              </label>
              <DatePicker
                selected={form.tanggal_transaksi}
                onChange={(date) =>
                  setForm((prev) => ({ ...prev, tanggal_transaksi: date }))
                }
                dateFormat="yyyy-MM-dd"
                minDate={new Date(new Date().setDate(new Date().getDate() - 30))}
                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:outline-none focus:border-[#16425B] transition"
              />
            </div>

            <InputField
              icon={<Wallet size={18} />}
              label="Nominal (Rp)"
              name="nominal"
              value={form.nominal}
              onChange={handleChange}
              type="number"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Keterangan <span className="text-gray-400">(Opsional)</span>
            </label>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              className="w-full border-b border-gray-300 bg-transparent py-2 text-sm focus:outline-none focus:border-[#16425B] transition"
              rows="3"
              placeholder="Contoh: biaya tol, makan, parkir..."
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Upload Bukti <span className="text-gray-400">(Opsional)</span>
            </label>
            <input
              type="file"
              name="file_bukti"
              onChange={handleChange}
              className="text-sm text-gray-600 w-full max-w-full file:mr-4 file:py-1 file:px-4 file:border-0 file:rounded-full file:text-sm file:font-semibold file:bg-[#16425B] file:text-white hover:file:bg-[#1e5070] transition"
              accept="image/*,application/pdf"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className="px-5 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2 text-sm rounded-full bg-[#16425B] hover:bg-[#1e5070] text-white font-semibold shadow-md transition"
            >
              Ajukan
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// 🧩 Reusable InputField Component
function InputField({ icon, label, name, value, onChange, type = "text", disabled = false }) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-0 top-2.5 text-gray-400">{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
          className="w-full border-b border-gray-300 pl-7 pb-2 text-sm bg-transparent focus:outline-none focus:border-[#16425B] transition disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
