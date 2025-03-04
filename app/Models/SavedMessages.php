<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedMessages extends Model
{

    protected $fillable = [
        "save_conversation_id",
        "message_id",
    ];

    public function message()
    {
        return $this->belongsTo(Message::class, "message_id");
    }
}