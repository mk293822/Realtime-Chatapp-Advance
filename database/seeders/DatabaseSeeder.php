<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Friends;
use App\Models\Group;
use App\Models\GroupUsers;
use App\Models\Message;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();

        User::factory()->create([
            'name' => "admin",
            "email" => "admin@gmail.com",
            "password" => Hash::make("password"),
        ]);

        $con = 1;
        for ($i = 1; $i < 6; $i++) {
            for ($j = 6; $j < 12; $j++) {

                Conversation::factory()->create([
                    'id' => $con,
                    'user_id1' => $i,
                    'user_id2' => $j,
                    "status" => "accept",
                    "status_at" => now()
                ]);
                Message::factory(10)->create([
                    'sender_id' => $i,
                    'receiver_id' => $j,
                    'conversation_id' => $con,
                    'group_id' => null,
                ]);

                Conversation::where('id', $con)->update([
                    'last_message_id' => $con * 10,
                ]);

                $con++;
            }
        }


        $gro = 1;
        for ($i = 1; $i < 12; $i++) {
            Group::factory()->create([
                'id' => $gro,
                'owner_id' => $i,
            ]);

            for ($j = 1; $j < 12; $j++) {
                GroupUsers::factory()->create([
                    'group_id' => $gro,
                    'user_id' => $j,
                    "status" => "accept",
                    "status_at" => now()
                ]);
            }

            Message::factory(10)->create([
                'sender_id' => null,
                'receiver_id' => null,
                'conversation_id' => null,
                'group_id' => $gro,
            ]);

            Group::where('id', $gro)->update([
                'last_message_id' => $gro * 10 + 300,
            ]);

            $gro++;
        }
    }
}