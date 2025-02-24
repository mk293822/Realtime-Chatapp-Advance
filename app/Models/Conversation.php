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
        'last_message_id'
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

        $conversations = $users->map(function (User $user) {
            return $user->toConversationArray();
        })->concat($groups->map(function (Group $group) {
            return $group->toConversationArray();
        }));

        $statuses = [FriendStatusEnum::Accept->value => 1, FriendStatusEnum::Block->value => 2];

        return $conversations->sortBy(function ($con) use ($statuses) {
            return $statuses[$con['status']] ?? 3;
        });
    }
}