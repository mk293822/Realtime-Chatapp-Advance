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
                Message::factory(5)->create([
                    'sender_id' => $i,
                    'receiver_id' => $j,
                    'conversation_id' => $con,
                    'group_id' => null,
                ]);
                Message::factory(5)->create([
                    'sender_id' => $j,
                    'receiver_id' => $i,
                    'conversation_id' => $con,
                    'group_id' => null,
                ]);


                $con++;
            }
        }

        $conversations = Conversation::all();
        foreach ($conversations as $conversation) {
            $last_message_id = Message::where("conversation_id", $conversation->id)->latest()->first()->id;

            $conversation->update([
                'last_message_id' => $last_message_id,
            ]);
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
                Message::factory(10)->create([
                    'sender_id' => $j,
                    'receiver_id' => null,
                    'conversation_id' => null,
                    'group_id' => $gro,
                ]);
            }

            $gro++;
        }
        $groups = Group::all();
        foreach ($groups as $group) {

            $last_message_id = Message::where("group_id", $group->id)->latest()->first()->id;

            $group->update([
                'last_message_id' => $last_message_id,
            ]);
        }
    }
}