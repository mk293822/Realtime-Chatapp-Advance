<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageSavedConversation extends Model
{
    /** @use HasFactory<\Database\Factories\MessageSavedConversationFactory> */
    use HasFactory;

    protected $fillable = [
        "saved_by",
        "name",
    ];

    public function saved_by()
    {
        return $this->belongsTo(User::class, "saved_by");
    }
}