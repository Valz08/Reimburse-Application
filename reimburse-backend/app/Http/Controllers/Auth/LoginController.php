<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use LdapRecord\Container;
use LdapRecord\Models\ActiveDirectory\User as LdapUser;
use Illuminate\Support\Facades\Session;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $domainUsername = 'training\\' . $credentials['username'];
        $password = $credentials['password'];

        try {
            $provider = Container::getConnection('default');
            $success = $provider->auth()->attempt($domainUsername, $password);

            if (!$success) {
                return response()->json(['message' => 'Login gagal: kredensial salah'], 401);
            }

            $ldapUser = LdapUser::findBy('sAMAccountName', $credentials['username']);

            if (!$ldapUser) {
                return response()->json(['message' => 'User LDAP tidak ditemukan.'], 404);
            }

            $username = strtolower($ldapUser->getFirstAttribute('sAMAccountName'));
            $displayName = $ldapUser->getFirstAttribute('cn');

            // Cek grup
            $isAdmin = $ldapUser->groups()->where('cn', '=', 'PAM_ADMIN')->exists();
            $isUser = $ldapUser->groups()->where('cn', '=', 'USERS_KLAIMEE')->exists();

            if (!$isAdmin && !$isUser) {
                return response()->json(['message' => 'Akun tidak memiliki akses yang diizinkan.'], 403);
            }

            // Simpan ke session
            Session::put('ldap_user', [
                'username' => $username,
                'display_name' => $displayName,
                'is_admin' => $isAdmin,
            ]);

            return response()->json([
                'message' => 'Login berhasil',
                'user' => [
                    'username' => $username,
                    'display_name' => $displayName,
                    'is_admin' => $isAdmin,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat koneksi LDAP.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout()
    {
        Session::forget('ldap_user');

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me()
    {
        if (!Session::has('ldap_user')) {
            return response()->json(['message' => 'Belum login'], 401);
        }

        return response()->json([
            'user' => Session::get('ldap_user'),
        ]);
    }
}
