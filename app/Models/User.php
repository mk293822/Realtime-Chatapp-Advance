<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\FriendStatusEnum;
use App\Http\Resources\AttachmentResource;
use App\Http\Resources\CallMessageResource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
        'active',
        'avatar',
        'birth_date',
        'gender'
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

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_users', 'user_id', 'group_id');
    }



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
            "conversations.last_message_id as last_message_id",
            "conversations.id as conversation_id",
            "conversations.accept as accept",
            "conversations.reject as reject",
            "conversations.pending as pending",
            "conversations.block as block",
            "conversations.blocked_by as blocked_by",
            "conversations.status_at as status_at",
            "conversations.request_by as request_by",
            "conversations.status_by as status_by",
            "user_conversations_statuses.pin as pin",
            "user_conversations_statuses.archived as archived",
            "user_conversations_statuses.mute as mute",
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
            ->leftJoin("user_conversations_statuses", function ($join) use ($user_id) {
                $join->on("user_conversations_statuses.conversation_id", "=", "conversations.id")
                    ->where("user_conversations_statuses.user_id", "=", $user_id);
            })
            ->leftJoin("messages", "messages.id", "=", "conversations.last_message_id")
            ->orderBy('users.name')
            ->orderBy("users.created_at")
            ->orderBy("user_conversations_statuses.pin", "desc");

        return $query->get();
    }

    public function deleted_messages()
    {
        return $this->hasMany(DeletedMessage::class, "user_id");
    }

    public function toSelectedConversation()
    {
        $user_id = $this->id;
        $self_id = Auth::id();

        $user = User::select([
            'users.id',
            'users.name',
            'users.avatar',
            'conversations.id as conversation_id',
            "conversations.block as block",
            "user_conversations_statuses.pin as pin",
            "user_conversations_statuses.archived as archived",
            "user_conversations_statuses.mute as mute",
        ])
            ->join('conversations', function ($join) use ($self_id) {
                $join->on("conversations.user_id2", "=", "users.id")
                    ->where("conversations.user_id1", "=", $self_id)
                    ->orWhere(function ($query) use ($self_id) {
                        $query->on("conversations.user_id1", "=", "users.id")
                            ->where("conversations.user_id2", "=", $self_id);
                    });
            })
            ->leftJoin("user_conversations_statuses", function ($join) use ($self_id) {
                $join->on("user_conversations_statuses.conversation_id", "=", "conversations.id")
                    ->where("user_conversations_statuses.user_id", "=", $self_id);
            })
            ->where('users.id', $user_id)
            ->first();


        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
            "conversation_id" => $user->conversation_id,
            'is_conversation' => true,
            "is_group" => false,
            "is_save_conversation" => false,
            'pin'      => $user->pin == 1 ?? false,
            'archived' => $user->archived == 1 ?? false,
            'mute'     => $user->mute == 1 ?? false,
            "block" => $user->block == 1 ?? false,
        ];
    }

    public function message_save_conversation()
    {
        return $this->hasOne(MessageSavedConversation::class, "saved_by");
    }

    public function toConversationArray()
    {

        $deleted_message = DeletedMessage::where("user_id", Auth::id())->where("message_id", $this->last_message_id)->first();

        $last_message = Message::where("conversation_id", $this->conversation_id)
            ->where("id", "=", $this->last_message_id)
            ->latest()
            ->first();

        if ($deleted_message) {
            $deleted_message_ids = DeletedMessage::where("user_id", Auth::id())->pluck("message_id")->toArray();

            $last_message = Message::where("conversation_id", $this->conversation_id)
                ->where("id", "!=", $this->last_message_id)
                ->whereNotIn("id", $deleted_message_ids)
                ->latest()
                ->first();
        }

        $attachment = $last_message->attachments->first();
        $call_message = $last_message->call_message;

        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'birth_date'        => $this->birth_date . " UTC",
            'bio'               => $this->bio,
            'gender'            => $this->gender,
            'avatar'            => $this->avatar,
            'active'            => $this->active . " UTC",
            'last_message'      => $last_message->message,
            'last_message_date' => $last_message->created_at . " UTC",
            'sender_id'         => $last_message->sender_id,
            'last_message_id'   => $last_message->id,
            'conversation_id'   => $this->conversation_id,
            'request_by'        => $this->request_by,
            'status_by'         => $this->status_by,
            'accept'            => $this->accept == 1 ?? false,
            'reject'            => $this->reject == 1 ?? false,
            'pending'           => $this->pending == 1 ?? false,
            'status_at'         => $this->status_at . " UTC",
            'user_id'           => $this->user_id,
            'group_id'          => $this->group_id,
            'pin'               => $this->pin == 1 ?? false,
            'archived'          => $this->archived == 1 ?? false,
            'mute'              => $this->mute == 1 ?? false,
            'block'              => $this->block == 1 ?? false,
            "blocked_by"         => $this->blocked_by,
            'is_conversation'   => true,
            "is_save_conversation" => false,
            'is_group'          => false,
            'last_message_attachment' => $attachment ? new AttachmentResource($attachment) : null,
            'call_message' => $call_message ? new CallMessageResource($call_message) : null,
        ];
    }
}