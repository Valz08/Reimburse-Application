<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class UserDummy extends Authenticatable
{
    protected $table = 'users_dummy'; // ← PENTING ini pakai 's'

    protected $fillable = [
        'username',
        'password',
        'display_name',
        'is_admin',
    ];

    protected $hidden = ['password'];
}
