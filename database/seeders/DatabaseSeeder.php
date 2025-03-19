<?php

namespace Database\Seeders;

use App\Models\{Conversation, Friends, Group, GroupUsers, Message, User, UserConversationsStatus};
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Users
        $this->seedUsers();

        // Create Conversations & Messages
        $this->seedConversationsAndMessages();

        // Create Groups & Group Messages
        $this->seedGroupsAndMessages();

        // Update last_message_id in Conversations & Groups
        $this->updateLastMessages();

        // Update User Avatars & Statuses
        $this->updateUserDetails();
    }

    private function seedUsers(): void
    {
        User::factory(11)->create();
        User::factory()->create([
            'name' => "admin",
            "email" => "admin@gmail.com",
            "password" => Hash::make("password"),
        ]);
        User::factory(20)->create();
    }

    private function seedConversationsAndMessages(): void
    {
        $con = 1;


        for ($i = 1; $i < 13; $i++) {
            for ($j = $i + 1; $j < 13; $j++) {

                // Create Conversation
                $conversation = Conversation::factory()->create([
                    'id' => $con,
                    'user_id1' => $i,
                    'user_id2' => $j,
                    'accept' => true,
                    'status_at' => now(),
                    'request_by' => $i,
                ]);


                for ($k = 0; $k < 5; $k++) {

                    Message::factory()->create([
                        'sender_id' => $i,
                        'receiver_id' => $j,
                        'conversation_id' => $con,
                        'group_id' => null,
                        'message' => fake()->realText(100),
                        'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
                    ]);

                    Message::factory()->create([
                        'sender_id' => $j,
                        'receiver_id' => $i,
                        'conversation_id' => $con,
                        'group_id' => null,
                        'message' => fake()->realText(100),
                        'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
                    ]);
                }

                $con++;
            }
        }
    }

    private function seedGroupsAndMessages(): void
    {
        $gro = 1;

        for ($i = 1; $i < 10; $i++) {
            // Create Group
            $group = Group::factory()->create([
                'id' => $gro,
                'owner_id' => $i,
            ]);

            $userIds = collect(range(1, 30))->shuffle();

            for ($j = 1; $j < 10; $j++) {
                $accept = fake()->boolean(70);
                $pending = fake()->boolean(70);
                $userId = $userIds->pop();

                // Add User to Group
                GroupUsers::factory()->create([
                    'group_id' => $gro,
                    'user_id' => $userId,
                    'accept' => $accept,
                    'pending' => !$accept && $pending,
                    'reject' => !$accept && !$pending,
                    'status_at' => now(),
                ]);


                for ($k = 0; $k < 10; $k++) {

                    Message::factory()->create([
                        'sender_id' => $j,
                        'receiver_id' => null,
                        'conversation_id' => null,
                        'group_id' => $gro,
                        'message' => fake()->realText(100),
                        'created_at' => fake()->dateTimeBetween('-1 year', 'now'),
                    ]);
                }
            }

            $gro++;
        }
    }

    private function updateLastMessages(): void
    {
        Conversation::all()->each(function ($conversation) {
            $last_message = Message::where("conversation_id", $conversation->id)->latest()->first();
            if ($last_message) {
                $conversation->update(['last_message_id' => $last_message->id]);
            }
        });

        Group::all()->each(function ($group) {
            $last_message = Message::where("group_id", $group->id)->latest()->first();
            if ($last_message) {
                $group->update(['last_message_id' => $last_message->id]);
            }
        });
    }

    private function updateUserDetails(): void
    {
        User::all()->each(function ($user) {
            $user->update([
                'avatar' => "https://i.pravatar.cc/150?u=" . $user->id,
            ]);

            // User Group Statuses
            $user->groups()->each(function ($group) use ($user) {
                UserConversationsStatus::factory()->create([
                    'user_id' => $user->id,
                    'conversation_id' => null,
                    'group_id' => $group->id,
                    'pin' => fake()->boolean(10),
                    'archived' => fake()->boolean(10),
                    'mute' => fake()->boolean(10),
                ]);
            });

            // User Conversation Statuses
            Conversation::forUsers($user->id)->each(function ($conversation) use ($user) {
                UserConversationsStatus::factory()->create([
                    'user_id' => $user->id,
                    'conversation_id' => $conversation->id,
                    'group_id' => null,
                    'pin' => fake()->boolean(10),
                    'archived' => fake()->boolean(10),
                    'mute' => fake()->boolean(10),
                ]);
            });
        });
    }
}