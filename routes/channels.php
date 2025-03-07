<?php

use App\Http\Resources\UserResource;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('online', function (User $user) {
    return $user ? new UserResource($user) : null;
});

Broadcast::channel("message.conversation.{user_id1}-{user_id2}", function (User $user, $user_id1, $user_id2) {
    return $user->id == $user_id1 || $user->id == $user_id2 ? $user : null;
});

Broadcast::channel("message.group.{group_id}", function (User $user, $group_id) {
    return $user->groups->contains("id", $group_id) ? $user : null;
});

Broadcast::channel("conversation.{conversation_id}", function (User $user, $conversation_id) {
    return Conversation::forUsers($user->id)->get()->contains("id", $conversation_id) ? $user : null;
});