<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Reimbursement;

class ReimburseTransferController extends Controller
{
    public function initiate(Request $request, $id)
    {
        $reimburse = Reimbursement::findOrFail($id);

        if ($reimburse->status !== 'disetujui') {
            return response()->json(['message' => 'Reimburse belum disetujui'], 400);
        }

        $apiKey = env('TRIPAY_API_KEY');
        $privateKey = env('TRIPAY_PRIVATE_KEY');
        $merchantCode = env('TRIPAY_MERCHANT_CODE');
        $baseUrl = env('TRIPAY_BASE_URL');

        $merchantRef = 'INV-' . time();
        $amount = $reimburse->nominal;

        $signature = hash('sha256', $merchantCode . $merchantRef . $amount . $privateKey);

        $payload = [
            'method'         => 'QRIS', // bisa OVO, DANA, QRIS, dll
            'merchant_ref'   => $merchantRef,
            'amount'         => $amount,
            'customer_name'  => $reimburse->user_name,
            'customer_email' => 'tes@example.com',
            'customer_phone' => '081234567890',
            'order_items'    => [[
                'sku'      => 'SKU001',
                'name'     => 'Reimbursement',
                'price'    => $amount,
                'quantity' => 1
            ]],
            'callback_url'   => url('/api/tripay/callback'),
            'return_url'     => url('/dashboard'),
            'expired_time'   => time() + (60 * 60 * 24), // 1 hari
            'signature'      => $signature,
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->post($baseUrl . '/transaction/create', $payload);

        if ($response->successful()) {
            $data = $response->json()['data'];
            $reimburse->tripay_ref = $data['reference'];
            $reimburse->tripay_url = $data['checkout_url'];
            $reimburse->save();

            return response()->json(['url' => $data['checkout_url']]);
        }

        return response()->json(['message' => 'Gagal request Tripay', 'error' => $response->json()], 500);
    }

    public function handleCallback(Request $request)
    {
        $data = $request->all();

        $reimburse = Reimbursement::where('tripay_ref', $data['reference'])->first();
        if (!$reimburse) {
            return response()->json(['message' => 'Referensi tidak ditemukan'], 404);
        }

        if ($data['status'] === 'PAID') {
            $reimburse->status = 'ditransfer';
            $reimburse->paid_at = now();
        } else {
            $reimburse->status = 'gagal';
        }

        $reimburse->save();

        return response()->json(['message' => 'Callback berhasil diproses']);
    }
}
