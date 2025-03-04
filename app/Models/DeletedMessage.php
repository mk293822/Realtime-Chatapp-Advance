<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeletedMessage extends Model
{

    protected $fillable = [
        'message_id',
        'user_id',
        'is_last_message',
        'pre_message_id',
    ];
}