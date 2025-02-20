<?php

namespace App\Models;

use App\Enums\FriendStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Group extends Model
{
    use HasFactory;

    public static function boot()
    {
        parent::boot();


        static::saving(function ($model) {
            $now = $now = Carbon::now("UTC");
            if ($model->isDirty('status')) {
                $model->status_at = $now->format('Y-m-d H:i:s');
            }
        });
    }


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
            ->where(function ($query) {
                $query->where("group_users.status", "=", FriendStatusEnum::Accept->value)
                    ->orWhere("group_users.status", "=", FriendStatusEnum::Block->value);
            })
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
                    "avatar" => $user->avatar,
                    "status" => $group_user->status,
                    "status_at" => $group_user->status_at . " UTC",
                ];
            }),
            "status" => $this->status,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date . " UTC",
            'is_conversation' => false,
            "is_group" => true,
        ];
    }
}