<?php

namespace App\Models;

use App\Enums\FriendStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    public function group_users()
    {
        return $this->hasMany(GroupUsers::class, "group_id");
    }

    public function owner()
    {
        return $this->belongsTo(User::class, "owner_id");
    }

    public static function getExceptUser(User $user): object
    {
        $query = self::select('groups.*', 'messages.message as last_message', 'messages.created_at as last_message_date', "group_users.status as status")
            ->join('group_users', 'group_users.group_id', '=', 'groups.id')
            ->leftJoin('messages', 'messages.id', '=', 'groups.last_message_id')
            ->where('group_users.user_id', $user->id)
            ->orderBy('messages.created_at', 'desc')
            ->orderBy('groups.name');

        return $query->get();
    }

    public function toConversationArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,
            "owner" => $this->owner,
            "group_users" => $this->group_users()->get()->map(function ($group_user) {
                $user = $group_user->user;
                return [
                    "name" => $user->name,
                    "id" => $user->id,
                    "active" => $user->active,
                    "avatar" => $user->avatar
                ];
            }),
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date . " UTC",
            "status" => $this->status,
            'is_conversation' => false,
            "is_group" => true,
        ];
    }
}