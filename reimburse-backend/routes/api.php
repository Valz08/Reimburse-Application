<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReimbursementController;
use App\Helpers\TelegramHelper;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\ReimburseTransferController;


// routes/api.php

Route::get('/profile/{username}', [ProfileController::class, 'getByUsername']);

// ===============================
// AUTHENTIKASI (TIDAK BUTUH JWT)
// ===============================
Route::post('/login', [AuthController::class, 'login'])
->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);

// ===============================
// DAFTAR TELEGRAM USER CHAT_ID
// ===============================
Route::post('/register-telegram', function (Request $request) {
    $request->validate([
        'user_name' => 'required|string',
        'chat_id' => 'required|numeric',
    ]);

    DB::table('telegram_users')->updateOrInsert(
        ['user_name' => $request->user_name],
        ['chat_id' => $request->chat_id]
    );

    return response()->json([
        'message' => '✅ Telegram user registered successfully.'
    ]);
});

// ===============================
// TEST KIRIM TELEGRAM (TIDAK BUTUH JWT)
// ===============================
Route::get('/send-test-telegram', function () {
    $chatId = env('TELEGRAM_TEST_CHAT_ID');
    $message = '✅ Tes kirim dari Laravel ke Telegram berhasil!';
    
    $response = TelegramHelper::sendMessage($chatId, $message);

    return response()->json([
        'status' => 'Pesan dikirim ke Telegram',
        'telegram_response' => $response->json(),
    ]);
});

// ===============================
// WEBHOOK TELEGRAM (TIDAK BUTUH JWT)
// ===============================
Route::post('/telegram-webhook', function (Request $request) {
    $update = $request->all();

    if (isset($update['message'])) {
        $chatId = $update['message']['chat']['id'];
        $text   = trim($update['message']['text']);
        $firstName = $update['message']['from']['first_name'] ?? '-';

        if ($text === '/start') {
            TelegramHelper::sendMessage($chatId, "👋 Halo $firstName!\nSilakan kirim *username perusahaan* kamu.", [
                'parse_mode' => 'Markdown'
            ]);
        } else {
            DB::table('telegram_users')->updateOrInsert(
                ['user_name' => $text],
                ['chat_id' => $chatId]
            );

            TelegramHelper::sendMessage($chatId, "✅ Username *$text* berhasil didaftarkan!\nKamu sekarang akan menerima notifikasi otomatis dari Klaimee.", [
                'parse_mode' => 'Markdown'
            ]);
        }
    }

    return response()->json(['status' => 'ok']);
});

// ===============================
// ROUTE YANG WAJIB LOGIN (JWT)
// ===============================
Route::middleware('jwt.verify')->group(function () {

    // ===============================
    // DASHBOARD USER
    // ===============================
    Route::get('/user/dashboard', [ReimbursementController::class, 'dashboard']);

    // ===============================
    // API REIMBURSEMENT
    // ===============================
    Route::prefix('reimbursements')->group(function () {
        // ---------- UMUM ----------
        Route::get('/', [ReimbursementController::class, 'index']);
        Route::get('/recent', [ReimbursementController::class, 'recent']);
        Route::get('/stats', [ReimbursementController::class, 'stats']);
        Route::get('/{id}', [ReimbursementController::class, 'show']);

        // ---------- USER ----------
        Route::post('/', [ReimbursementController::class, 'store']);
        Route::get('/history/user', [ReimbursementController::class, 'userHistory']);

        // ---------- ADMIN ----------
        Route::put('/{id}', [ReimbursementController::class, 'update']);
        Route::get('/pending/admin', [ReimbursementController::class, 'pendingForAdmin']);
        Route::get('/history/admin', [ReimbursementController::class, 'adminHistory']);
        Route::get('/export/csv', [ReimbursementController::class, 'exportCSV']);
        Route::post('/import/csv', [ReimbursementController::class, 'importCSV']);
        Route::post('/{id}/transfer', [ReimburseTransferController::class, 'transfer']);


        // ---------- NOTIFIKASI ----------
        Route::get('notifications/unread', [ReimbursementController::class, 'getUnreadNotifications']);
        Route::post('notifications/mark-read', [ReimbursementController::class, 'markNotificationsRead']);
    });
});
