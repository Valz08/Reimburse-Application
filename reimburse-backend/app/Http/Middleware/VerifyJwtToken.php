<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

class VerifyJwtToken
{
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'error' => 'unauthorized',
                'message' => 'Token tidak ditemukan atau format salah.'
            ], 401);
        }

        $token = str_replace('Bearer ', '', $authHeader);

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));

            // Simpan username & role di request (kalau dibutuhkan)
            $request->attributes->add([
                'username' => $decoded->username,
                'role' => $decoded->role,
            ]);
        } catch (ExpiredException $e) {
            return response()->json([
                'error' => 'expired_token',
                'message' => 'Sesi kamu sudah berakhir. Silakan login ulang.'
            ], 440); // kode HTTP custom: Login Timeout
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'invalid_token',
                'message' => 'Token tidak valid.'
            ], 401);
        }

        return $next($request);
    }
}
