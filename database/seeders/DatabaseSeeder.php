<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Friends;
use App\Models\Group;
use App\Models\GroupUsers;
use App\Models\Message;
use App\Models\User;
use App\Models\UserConversationsStatus;
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
        User::factory(11)->create();

        User::factory()->create([
            'name' => "admin",
            "email" => "admin@gmail.com",
            "password" => Hash::make("password"),
        ]);

        $con = 1;
        for ($i = 1; $i < 13; $i++) {
            for ($j = $i + 1; $j < 13; $j++) {

                $accept = fake()->boolean(70);
                $pending = fake()->boolean(70);
                Conversation::factory()->create([
                    'id' => $con,
                    'user_id1' => $i,
                    'user_id2' => $j,
                    'accept' => $accept,
                    'pending' => !$accept &&  $pending,
                    'reject' => !$accept && !$pending ? true : false,
                    'status_at' => now(),
                    'request_by' => $i,
                    'status_by' => $j,
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
        for ($i = 1; $i < 13; $i++) {
            Group::factory()->create([
                'id' => $gro,
                'owner_id' => $i,
            ]);

            for ($j = 1; $j < 13; $j++) {

                $accept = fake()->boolean(70);
                $pending = fake()->boolean(70);
                GroupUsers::factory()->create([
                    'group_id' => $gro,
                    'user_id' => $j,
                    'accept' => $accept,
                    'pending' => !$accept && $pending,
                    'reject' => !$accept && !$pending ? true : false,
                    'status_at' => now(),
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

        $users = User::all();
        foreach ($users as $user) {
            $user->update([
                'avatar' => "https://i.pravatar.cc/150?u=" . $user->id,
            ]);

            $user->groups()->get()->each(function ($group) use ($user, $accept, $pending) {
                UserConversationsStatus::factory()->create([
                    'user_id' => $user->id,
                    'conversation_id' => null,
                    'group_id' => $group->id,
                    'pin' => fake()->boolean(10),
                    'archived' => fake()->boolean(10),
                    'mute' => fake()->boolean(10),
                ]);
            });

            $user->conversations()->get()->each(function ($conversation) use ($user, $accept, $pending) {
                UserConversationsStatus::factory()->create([
                    'user_id' => $user->id,
                    'conversation_id' => $conversation->id,
                    'group_id' => null,
                    'pin' => fake()->boolean(10),
                    'archived' => fake()->boolean(10),
                    'mute' => fake()->boolean(10),
                ]);
            });
        }
    }
}