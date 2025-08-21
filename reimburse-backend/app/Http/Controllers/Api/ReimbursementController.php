<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Reimbursement;
use Illuminate\Support\Facades\Storage;
use App\Models\Notification;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Helpers\TelegramHelper;
use Illuminate\Support\Facades\DB;

class ReimbursementController extends Controller
{
    public function index(Request $request)
    {
         $username = $request->query('username');
       if (!$username) {
        return response()->json(['message' => 'Parameter username wajib diisi'], 400);
    }

    $data = Reimbursement::where('user_name', $username)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json($data);
    }

    public function recent()
    {
        return Reimbursement::orderBy('created_at', 'desc')->get();
    }

    public function dashboard(Request $request)
    {
        $username = $request->get('username');

        if (!$username) {
            return response()->json([
                'message' => 'Username tidak ditemukan di token.',
            ], 400);
        }

        $data = Reimbursement::where('user_name', $username)
            ->where(function ($query) {
                $query->where('status', 'menunggu')
                      ->orWhere(function ($q) {
                          $q->where('status', 'disetujui')
                            ->whereNull('transferred_at');
                      });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Data dashboard berhasil diambil.',
            'data' => $data,
        ]);
    }

    public function stats()
    {
        return [
            'total'     => Reimbursement::count(),
            'menunggu'  => Reimbursement::where('status', 'menunggu')->count(),
            'disetujui' => Reimbursement::where('status', 'disetujui')->count(),
            'ditolak'   => Reimbursement::where('status', 'ditolak')->count(),
        ];
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_name'           => 'required|string',
            'nip'                 => 'required|string',
            'jabatan'             => 'required|string',
            'divisi'              => 'required|string',
            'jenis'               => 'required|string',
            'tanggal_transaksi'   => 'required|date',
            'nominal'             => 'required|numeric',
            'keterangan'          => 'nullable|string|max:50',
            'file_bukti'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('file_bukti')) {
            $path = $request->file('file_bukti')->store('bukti', 'public');
        }

        $reimbursement = Reimbursement::create([
            'user_name'           => $request->user_name,
            'nip'                 => $request->nip,
            'jabatan'             => $request->jabatan,
            'divisi'              => $request->divisi,
            'jenis'               => $request->jenis,
            'tanggal_transaksi'   => $request->tanggal_transaksi,
            'nominal'             => $request->nominal,
            'keterangan'          => $request->keterangan,
            'bukti'               => $path,
            'status'              => 'menunggu',
        ]);

        Notification::create([
            'receiver'  => 'admin',
            'message'   => 'Reimburse dari ' . $reimbursement->user_name . ' telah diajukan.',
            'user_name' => $reimbursement->user_name,
            'jenis'     => $reimbursement->jenis,
            'status'    => $reimbursement->status,
            'is_read'   => false,
        ]);

        Log::info('Pengajuan Reimburse', [
            'oleh'     => $reimbursement->user_name,
            'nominal' => $reimbursement->nominal,
            'jenis'   => $reimbursement->jenis,
            'waktu'   => now()->toDateTimeString(),
        ]);

        $chatId = env('TELEGRAM_ADMIN_CHAT_ID');
        $message = "📢 *Pengajuan Klaim Baru*\n"
            . "👤 User: {$reimbursement->user_name}\n"
            . "💰 Nominal: Rp " . number_format($reimbursement->nominal, 0, ',', '.') . "\n"
            . "📝 Keterangan: {$reimbursement->keterangan}\n"
            . "📅 Tanggal: " . now()->format('d-m-Y H:i');

        TelegramHelper::sendMessage($chatId, $message);

        return response()->json([
            'message' => 'Berhasil mengajukan reimburse.',
            'data'    => $reimbursement
        ], 201);
    }

    public function show(string $id)
    {
        $reimbursement = Reimbursement::find($id);
        if (!$reimbursement) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($reimbursement);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:menunggu,disetujui,ditolak'
        ]);

        $reimbursement = Reimbursement::findOrFail($id);
        $reimbursement->status = $request->status;
        $reimbursement->save();

        Notification::create([
            'receiver'  => $reimbursement->user_name,
            'message'   => 'Reimbursement kamu telah ' . $reimbursement->status . '.',
            'status'    => $reimbursement->status,
            'jenis'     => $reimbursement->jenis,
            'is_read'   => false,
        ]);

        $userChatId = DB::table('telegram_users')
            ->where('user_name', $reimbursement->user_name)
            ->value('chat_id');

        if ($userChatId) {
            $msgStatus = $reimbursement->status === 'disetujui'
                ? '✅ *Reimburse kamu disetujui!*'
                : '❌ *Reimburse kamu ditolak!*';

            $message = "$msgStatus\n"
                . "🧾 Jenis: {$reimbursement->jenis}\n"
                . "💰 Nominal: Rp " . number_format($reimbursement->nominal, 0, ',', '.') . "\n"
                . "📅 Tanggal: " . \Carbon\Carbon::parse($reimbursement->tanggal_transaksi)->format('d-m-Y');

            TelegramHelper::sendMessage($userChatId, $message);
        }

        Log::info('Update Status Reimburse oleh Admin', [
            'id'           => $reimbursement->id,
            'status_baru'  => $reimbursement->status,
            'user_pengaju' => $reimbursement->user_name,
            'waktu'        => now()->toDateTimeString(),
        ]);

        return response()->json([
            'message' => 'Status berhasil diperbarui.',
            'data'    => $reimbursement,
        ]);
    }

      public function userHistory(Request $request)
{
    $userName = $request->query('user_name');

    if (!$userName) {
        return response()->json(['message' => 'Parameter user_name wajib diisi'], 400);
    }

    return Reimbursement::where('user_name', $userName)
        ->whereIn('status', ['disetujui', 'ditolak'])
        ->orderBy('updated_at', 'desc')
        ->get();
}

    public function pendingForAdmin()
    {
        return Reimbursement::where('status', 'menunggu')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function adminHistory()
    {
        return Reimbursement::whereIn('status', ['disetujui', 'ditolak'])
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function getUnreadNotifications(Request $request)
    {
        $userName = $request->query('user_name');
        if (!$userName) {
            return response()->json(['message' => 'Parameter user_name wajib diisi'], 400);
        }

        $notifications = Notification::where('receiver', $userName)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    public function markNotificationsRead(Request $request)
    {
        $userName = $request->input('user_name');
        if (!$userName) {
            return response()->json(['message' => 'Parameter user_name wajib diisi'], 400);
        }

        Notification::where('receiver', $userName)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifikasi sudah ditandai dibaca']);
    }

    public function exportCSV()
    {
        $reimbursements = Reimbursement::all();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="reimbursements.csv"',
        ];

        Log::info('Export CSV oleh Admin', [
            'total_data' => $reimbursements->count(),
            'waktu' => now()->toDateTimeString(),
        ]);

        $callback = function () use ($reimbursements) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Nama', 'NIP', 'Jabatan', 'Divisi', 'Jenis', 'Tanggal', 'Nominal','Keterangan', 'Status']);

            foreach ($reimbursements as $item) {
                fputcsv($file, [
                    $item->user_name,
                    $item->nip,
                    $item->jabatan,
                    $item->divisi,
                    $item->jenis,
                    $item->tanggal_transaksi,
                    $item->nominal,
                    $item->keterangan ?? '-',
                    $item->status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function importCSV(Request $request)
    {
        if (!$request->hasFile('csv_file')) {
            return response()->json(['message' => 'CSV file is required.'], 400);
        }

        $file = $request->file('csv_file');

        if ($file->getClientOriginalExtension() !== 'csv') {
            return response()->json(['message' => 'File must be a CSV.'], 400);
        }

        $handle = fopen($file->getRealPath(), 'r');

        $line = fgets($handle);
        $line = preg_replace('/^\xEF\xBB\xBF/', '', $line);
        $header = str_getcsv(trim($line));

        $expectedHeader = ['Nama', 'NIP', 'Jabatan', 'Divisi', 'Jenis', 'Tanggal', 'Nominal', 'Keterangan', 'Status'];

        if ($header !== $expectedHeader) {
            return response()->json([
                'message' => '❌ Header CSV tidak sesuai format export.',
                'diharapkan' => $expectedHeader,
                'didapat' => $header,
            ], 422);
        }

        $rowsInserted = 0;

        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) < 9) continue;

            [$nama, $nip, $jabatan, $divisi, $jenis, $tanggal, $nominal, $keterangan, $status] = $data;

            if (!$nama || !$nip || !$jabatan || !$divisi || !$jenis || !$tanggal || !$nominal) continue;
            if (!is_numeric($nip) || !is_numeric($nominal) || $nominal <= 0) continue;

            try {
                Reimbursement::create([
                    'user_name' => $nama,
                    'nip' => $nip,
                    'jabatan' => $jabatan,
                    'divisi' => $divisi,
                    'jenis' => $jenis,
                    'tanggal_transaksi' => \Carbon\Carbon::parse($tanggal)->format('Y-m-d'),
                    'nominal' => $nominal,
                    'keterangan' => $keterangan !== '-' ? $keterangan : null,
                    'status' => in_array(strtolower($status), ['disetujui', 'ditolak']) ? strtolower($status) : 'menunggu',
                ]);
                $rowsInserted++;
            } catch (\Exception $e) {
                Log::warning('Gagal import satu baris CSV:', ['error' => $e->getMessage(), 'baris' => $data]);
                continue;
            }
        }

        fclose($handle);

        Log::info('Import CSV oleh Admin', [
            'data_berhasil' => $rowsInserted,
            'waktu' => now()->toDateTimeString(),
        ]);

        return response()->json([
            'message' => "✅ Berhasil import $rowsInserted data reimburse dari CSV."
        ]);
    }

    public function destroy(string $id)
    {
        //
    }
}
