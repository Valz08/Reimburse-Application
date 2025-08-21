<?php

use Illuminate\Support\Facades\Route;
use LdapRecord\Container;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/ldap-test', function () {
    try {
        $connection = Container::getDefaultConnection();
        $connection->connect();

        return 'Koneksi ke LDAP Berhasil!';
    } catch (\Exception $e) {
        return 'Gagal konek: ' . $e->getMessage();
    }
});
