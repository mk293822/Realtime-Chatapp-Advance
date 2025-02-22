<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{

    protected $fillable = [
        "message_id",
        "name",
        "mime",
        "size",
        "path"
    ];

    public function message()
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}