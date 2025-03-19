<?php

namespace App\Models;

use App\Enums\FriendStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id1',
        'user_id2',
        'last_message_id',
        'pending',
        'accept',
        'reject',
        'block',
        'status_at',
        'blocked_by',
        'request_by'
    ];

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

    public function scopeForUsers($query, $user_id)
    {
        return $query->where('user_id1', $user_id)->orWhere("user_id2", $user_id);
    }


    public function user1()
    {
        return $this->belongsTo(User::class, "user_id1");
    }


    public function user2()
    {
        return $this->belongsTo(User::class, "user_id2");
    }

    public function lastMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }



    public static function getConversationsForSidebar(User $exceptUser)
    {
        $users = User::getExceptUser($exceptUser);
        $groups = Group::getExceptUser($exceptUser);


        $conversations = $users->map(function ($user) {
            return $user->toConversationArray();
        })->concat($groups->map(function ($group) {
            return $group->toConversationArray();
        }));

        return $conversations;
    }
}