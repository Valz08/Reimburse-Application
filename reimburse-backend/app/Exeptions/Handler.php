<?php
use Illuminate\Http\Exceptions\ThrottleRequestsException;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        if ($exception instanceof ThrottleRequestsException) {
            return response()->json([
                'message' => 'Terlalu banyak percobaan login. Coba lagi dalam 1 menit.',
            ], 429);
        }

        return parent::render($request, $exception);
    }
}
