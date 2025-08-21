<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reimbursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_name',
        'nip',
        'jabatan',
        'divisi',
        'jenis',
        'tanggal_transaksi',
        'nominal',
        'keterangan',
        'bukti',
        'status',
    ];

      public function user()
    {
        return $this->belongsTo(User::class, 'user_name', 'name');
        // 'user_name' di Reimbursement, 'username' di User
    }
}
