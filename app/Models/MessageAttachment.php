<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageAttachment extends Model
{
    public function message()
    {
        return $this->belongsTo(Message::class, 'message_id');
    }
}