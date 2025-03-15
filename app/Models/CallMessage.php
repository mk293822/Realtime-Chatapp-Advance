<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CallMessage extends Model
{
    protected $fillable = [
        "message_id",
        "is_video",
        "accept",
        "period"
    ];
}
