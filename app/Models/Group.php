<?php

namespace App\Models;

use App\Http\Resources\UserResource;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'owner_id',
        'last_message_id'
    ];


    public function lastMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
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
        $query = Group::select([
            'groups.*',
            'messages.message as last_message',
            'messages.created_at as last_message_date',
            "user_conversations_statuses.pin as pin",
            "user_conversations_statuses.archived as archived",
            "user_conversations_statuses.mute as mute",
            "group_users.accept as accept",
            "group_users.reject as reject",
            "group_users.pending as pending",
            'group_users.status_at as status_at',
        ])
            ->join('group_users', 'group_users.group_id', '=', 'groups.id')
            ->where('group_users.user_id', $user->id)
            ->leftJoin('messages', 'messages.id', '=', 'groups.last_message_id')
            ->join("user_conversations_statuses", function ($join) use ($user) {
                $join->on("user_conversations_statuses.group_id", "=", "groups.id")
                    ->where("user_conversations_statuses.user_id", "=", $user->id);
            })
            ->orderBy('messages.created_at', 'desc')
            ->orderBy('groups.name')
            ->orderBy("user_conversations_statuses.pin", "desc");


        return $query->get();
    }

    public function toSelectedConversationArray()
    {
        $group_id = $this->id;
        $self_id = Auth::id();

        $query = Group::select([
            'groups.*',
            "user_conversations_statuses.pin as pin",
            "user_conversations_statuses.archived as archived",
            "user_conversations_statuses.mute as mute",
        ])
            ->where("groups.id", "=", $group_id)
            ->join("user_conversations_statuses", function ($join) use ($self_id) {
                $join->on("user_conversations_statuses.group_id", "=", "groups.id")
                    ->where("user_conversations_statuses.user_id", "=", $self_id);
            })
            ->orderBy('groups.name')
            ->orderBy("user_conversations_statuses.pin", "desc")->first();

        return [
            'id' => $query->id,
            'name' => $query->name,
            'avatar' => $query->avatar,
            "owner" => (new UserResource($query->owner))->toArray(request()),
            "group_users" => UserResource::collection(collect($query->group_users->pluck('user')))->toArray(request()),
            "is_save_conversation" => false,
            'is_conversation' => false,
            "is_group" => true,
            'pin'      => $query->pin == 1 ?? false,
            'archived' => $query->archived == 1 ?? false,
            'mute'     => $query->mute == 1 ?? false,
        ];
    }

    public function toConversationArray()
    {
        $deleted_message = DeletedMessage::where("user_id", Auth::id())->where("message_id", $this->last_message_id)->first();
        $last_message = null;
        if ($deleted_message) {
            $deleted_message_ids = DeletedMessage::where("user_id", Auth::id())->pluck("message_id")->toArray();

            $last_message = Message::where("group_id", $this->id)
                ->where("id", "!=", $this->last_message_id)
                ->whereNotIn("id", $deleted_message_ids)
                ->latest()->limit(1)->first();
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->avatar,
            "owner" => (new UserResource($this->owner))->toArray(request()),
            "group_users" => UserResource::collection(collect($this->group_users->pluck('user')))->toArray(request()),
            'last_message'      => $deleted_message ? $last_message->message : $this->last_message,
            'last_message_date' => $deleted_message ? $last_message->created_at : $this->last_message_date . " UTC",
            'last_message_id'   => $deleted_message ? $last_message->id : $this->last_message_id,
            'is_conversation' => false,
            "is_save_conversation" => false,
            "is_group" => true,
            'pin'      => $this->pin == 1 ?? false,
            'archived' => $this->archived == 1 ?? false,
            'mute'     => $this->mute == 1 ?? false,
            'accept'   => $this->accept == 1 ?? false,
            'reject'   => $this->reject == 1 ?? false,
            'pending'  => $this->pending == 1 ?? false,
            'status_at' => $this->status_at . " UTC",
        ];
    }
}