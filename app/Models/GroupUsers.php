<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class GroupUsers extends Model
{
    /** @use HasFactory<\Database\Factories\GroupUsersFactory> */
    use HasFactory;


    public static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            $now = $now = Carbon::now("UTC");
            if ($model->isDirty('status')) {
                $model->status_at = $now->format('Y-m-d H:i:s');
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}