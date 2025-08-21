import React, { useState } from "react";
import axiosWithAuth from "../utils/axiosWithAuth";
import toast from "react-hot-toast";

export default function TransferModal({ isOpen, onClose, reimbursement }) {
  const [walletType, setWalletType] = useState("OVO");
  const [walletPhone, setWalletPhone] = useState(reimbursement?.wallet_phone || "");
  const [note, setNote] = useState("");

  const handleTransfer = async () => {
    try {
      await axiosWithAuth.post(`/reimbursements/${reimbursement.id}/transfer`, {
        wallet_type: walletType,
        wallet_phone: walletPhone,
        transfer_note: note,
      });
      toast.success("✅ Dana berhasil disimulasikan!");
      onClose(true);
    } catch (err) {
      toast.error("❌ Gagal mencairkan dana.");
    }
  };

  if (!isOpen || !reimbursement) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-[400px]">
        <h2 className="text-lg font-semibold mb-4 text-[#16425B]">Simulasi Pencairan</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">E-Wallet</label>
            <select
              className="w-full border p-2 rounded"
              value={walletType}
              onChange={(e) => setWalletType(e.target.value)}
            >
              <option value="OVO">OVO</option>
              <option value="Dana">Dana</option>
              <option value="GoPay">GoPay</option>
              <option value="ShopeePay">ShopeePay</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Nomor HP Tujuan</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={walletPhone}
              onChange={(e) => setWalletPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Catatan</label>
            <textarea
              rows={2}
              className="w-full border p-2 rounded"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => onClose(false)} className="px-4 py-2 border rounded">
            Batal
          </button>
          <button
            onClick={handleTransfer}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Cairkan
          </button>
        </div>
      </div>
    </div>
  );
}
