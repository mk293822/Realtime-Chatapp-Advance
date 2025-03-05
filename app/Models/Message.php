<?php

namespace App\Models;

use App\Observers\MessageObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([MessageObserver::class])]
class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'message',
        'conversation_id',
        'group_id',
        'receiver_id',
        'sender_id',
    ];

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class, 'message_id');
    }
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function group_users()
    {
        return $this->hasMany(GroupUsers::class, "group_id", "group_id");
    }

    public function saved_message()
    {
        return $this->hasMany(SavedMessages::class, "message_id");
    }

    // public function scopeForIs_Deleted(User $user)
    // {
    //     $deleted_message = DeletedMessage::where("user_id", $user->id)
    //         ->where("message_id", $this->id)
    //         ->first();
    //     return $deleted_message;
    // }
}