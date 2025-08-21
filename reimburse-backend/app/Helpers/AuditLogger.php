<?php
namespace App\Helpers;

use Illuminate\Support\Facades\Request;
use App\Models\AuditLog;

class AuditLogger
{
    public static function log($username, $action, $description)
    {
        AuditLog::create([
            'username'    => $username,
            'action'      => $action,
            'description' => $description,
            'ip'          => Request::ip(),
        ]);
    }
}
