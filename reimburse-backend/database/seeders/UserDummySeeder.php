<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\UserDummy;

class UserDummySeeder extends Seeder
{
    public function run(): void
    {
        UserDummy::updateOrCreate(
            ['username' => 'revaldi.setianto'],
            [
                'password' => Hash::make('demo123'),
                'display_name' => 'Revaldi Setianto',
                'is_admin' => false,
            ]
        );

        UserDummy::updateOrCreate(
            ['username' => 'min.revaldi'],
            [
                'password' => Hash::make('admin123'),
                'display_name' => 'Admin Revaldi',
                'is_admin' => true,
            ]
        );
        UserDummy::updateOrCreate(
            ['username' => 'asy.syams'],
            [
                'password' => Hash::make('demo123'),
                'display_name' => 'Asy Syams',
                'is_admin' => false,
            ]
        );

        UserDummy::updateOrCreate(
            ['username' => 'min.syams'],
            [
                'password' => Hash::make('admin123'),
                'display_name' => 'Admin Asy Syams',
                'is_admin' => true,
            ]
        );
        UserDummy::updateOrCreate(
            ['username' => 'muhammad.septiawan'],
            [
                'password' => Hash::make('demo123'),
                'display_name' => 'Muhammad Septiawan',
                'is_admin' => false,
            ]
        );
    }
}
