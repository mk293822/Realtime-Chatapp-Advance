<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\FriendStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public static function getExceptUser(User $user): object
    {

        $user_id = $user->id;

        $query = User::select([
            "users.*",
            "messages.message as last_message",
            "messages.created_at as last_message_date",
            "conversations.status as status",
            "conversations.id as conversation_id"
        ])
            ->where('users.id', '!=', $user_id)
            ->join('conversations', function ($join) use ($user_id) {
                $join->on("conversations.user_id2", "=", "users.id")
                    ->where("conversations.user_id1", "=", $user_id)
                    ->orWhere(function ($query) use ($user_id) {
                        $query->on("conversations.user_id1", "=", "users.id")
                            ->where("conversations.user_id2", "=", $user_id);
                    });
            })
            ->leftJoin("messages", "messages.id", "=", "conversations.last_message_id")
            ->orderBy('users.name')
            ->orderBy("users.created_at");


        return $query->get();
    }

    public function toConversationArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date . " UTC",
            "status" => $this->status,
            "conversation_id" => $this->conversation_id,
            'is_conversation' => true,
            "is_group" => false,
            "active" => $this->active
        ];
    }
}