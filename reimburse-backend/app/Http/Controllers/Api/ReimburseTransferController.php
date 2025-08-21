<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Reimbursement;
use Carbon\Carbon;
use App\Http\Controllers\Controller;

class ReimburseTransferController extends Controller
{
    public function transfer(Request $request, $id)
    {
        // Validasi request
        $request->validate([
            'wallet_type'   => 'required|string',  // Misalnya: OVO, DANA, QRIS, dll.
            'wallet_phone'  => 'required|string',
            'transfer_note' => 'nullable|string',
        ]);

        // Ambil data reimburse dari DB
        $reimburse = Reimbursement::findOrFail($id);

        // Pastikan status disetujui
        if ($reimburse->status !== 'disetujui') {
            return response()->json(['message' => 'Reimburse belum disetujui.'], 400);
        }

        // === Konfigurasi Tripay ===
        $merchantCode = 'T42640';
        $apiKey       = 'DEV-9huDoVdw7Vk9qxNXBwYn1dkchffrEO9yDPYpfR1M';
        $privateKey   = 'rtzej-xEvTv-jjA2g-JgIRB-gocMn';

        // === Siapkan data transaksi ===
        $amount      = intval($reimburse->nominal); // Pastikan integer
        $merchantRef = 'RB-' . $reimburse->id . '-' . time();
        $expired     = time() + (24 * 60 * 60); // expired 1 hari

        // === Buat signature SHA256 ===
        $signature = hash_hmac('sha256', $merchantCode . $merchantRef . $amount, $privateKey);

        // === Payload transaksi ke Tripay ===
        $payload = [
            "method"         => $request->wallet_type,
            "merchant_ref"   => $merchantRef,
            "amount"         => $amount,
            "customer_name"  => $reimburse->user_name,
            "customer_email" => $reimburse->user_email ?? 'user@example.com',
            "customer_phone" => $request->wallet_phone,
            "order_items"    => [
                [
                    "sku"      => "REIMBURSE001",
                    "name"     => "Pengajuan Reimburse",
                    "price"    => $amount,
                    "quantity" => 1
                ]
            ],
            "callback_url" => "https://yourdomain.com/api/callback/tripay",
            "return_url"   => "https://yourdomain.com/dashboard",
            "expired_time" => $expired,
            "signature"    => $signature
        ];

        // === Kirim request ke Tripay ===
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->post('https://tripay.co.id/api-sandbox/transaction/create', $payload);

        $result = $response->json();

        // === Cek jika gagal ===
        if (!$result['success']) {
            return response()->json([
                'message' => 'Gagal membuat transaksi Tripay',
                'error'   => $result['message']
            ], 500);
        }

        // === Simpan ke database ===
        $reimburse->wallet_type    = $request->wallet_type;
        $reimburse->wallet_phone   = $request->wallet_phone;
        $reimburse->transfer_note  = $request->transfer_note;
        $reimburse->tripay_ref     = $result['data']['reference'];
        $reimburse->checkout_url   = $result['data']['checkout_url'];
        $reimburse->transferred_at = Carbon::now();
        $reimburse->save();

        // === Kembalikan response ke frontend ===
        return response()->json([
            'message'      => '✅ Transaksi berhasil dibuat',
            'checkout_url' => $result['data']['checkout_url'],
            'reference'    => $result['data']['reference'],
        ]);
    }
}
