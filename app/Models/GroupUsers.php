<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupUsers extends Model
{
    /** @use HasFactory<\Database\Factories\GroupUsersFactory> */
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}