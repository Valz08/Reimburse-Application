<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\UserProfile;
use Illuminate\Routing\Controller;

class ProfileController extends Controller
{
    public function getByUsername($username)
    {
        $profile = UserProfile::where('username', $username)->first();

        if (!$profile) {
            return response()->json(['message' => 'Profil tidak ditemukan'], 404);
        }

        return response()->json([
            'nip' => $profile->nip,
            'jabatan' => $profile->jabatan,
            'divisi' => $profile->divisi,
        ]);
    }   
}
