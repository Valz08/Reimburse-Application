<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Http\Controllers\Controller;
use Firebase\JWT\JWT;
use App\Helpers\AuditLogger;
use App\Models\UserDummy;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
public function login(Request $request)
{
    $credentials = $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
        'role'     => 'required|in:user,admin',
    ]);

    $user = UserDummy::where('username', $credentials['username'])->first();

    if (!$user || !Hash::check($credentials['password'], $user->password)) {
        return response()->json(['message' => 'Username atau password salah'], 401);
    }

    // Cek role
    if ($credentials['role'] === 'admin' && !$user->is_admin) {
        return response()->json(['message' => 'Bukan akun admin'], 403);
    }


    $sessionData = [
        'username'     => strtolower($user->username),
        'display_name' => $user->display_name,
        'is_admin'     => $user->is_admin,
    ];

    session(['ldap_user' => $sessionData]);

    $payload = [
        'username' => $sessionData['username'],
        'role'     => $user->is_admin ? 'admin' : 'user',
        'exp'      => time() + 3600,
    ];

    $token = \Firebase\JWT\JWT::encode($payload, env('JWT_SECRET'), 'HS256');

    return response()->json([
        'message' => 'Login berhasil',
        'user'    => $sessionData,
        'token'   => $token,
    ]);
}



    public function logout(Request $request)
    {
        $user = Session::get('ldap_user');
        if ($user) {
            AuditLogger::log(
                $user['username'],
                'logout',
                'User logout dari sistem'
            );
        }

        Session::forget('ldap_user');

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me(Request $request)
    {
        $user = Session::get('ldap_user');
        if (!$user) {
            return response()->json(['message' => 'Belum login.'], 401);
        }

        return response()->json(['user' => $user]);
    }
}
