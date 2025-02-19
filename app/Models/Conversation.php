<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Conversation extends Model
{
    use HasFactory;


    public function user1()
    {
        return $this->belongsTo(User::class, "user_id1");
    }


    public function user2()
    {
        return $this->belongsTo(User::class, "user_id2");
    }



    public static function getConversationsForSidebar(User $exceptUser)
    {
        $users = User::getExceptUser($exceptUser);
        $groups = Group::getExceptUser($exceptUser);


        return $users->map(function (User $user) {
            return $user->toConversationArray();
        })->concat($groups->map(function (Group $group) {
            return $group->toConversationArray();
        }));
    }
}