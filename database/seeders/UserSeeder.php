<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@admin.com')->first();
        $clientUser = User::where('email', 'client@client.com')->first();

        if (! isset($adminUser)) {
            $adminUser = User::create([
                'email' => 'admin@admin.com',
                'name' => 'Admin',
                'password' => Hash::make('Admin.23'),
            ]);
        }

        if (! isset($clientUser)) {
            $clientUser = User::create([
                'email' => 'client@client.com',
                'name' => 'Client',
                'password' => Hash::make('Client.23'),
            ]);

            Client::create([
                'contact' => '08123123123',
                'user_id' => $clientUser->id,
            ]);
        }

        $adminUser->assignRole('admin');
        $clientUser->assignRole('client');
    }
}
