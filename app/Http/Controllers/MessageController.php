<?php

namespace App\Http\Controllers;

use App\Http\Resources\MessageResource;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function conversation($user)
    {
        $user_conversation = User::where("id", $user)->first()->toConversationArray();
        $messages = Message::where("conversation_id", $user_conversation['conversation_id'])->latest()->paginate(10);

        return inertia("Dashboard", [
            "messages" => MessageResource::collection($messages),
            "selected_conversation" => $user_conversation,
        ]);
    }
    public function group(Group $group)
    {
        $messages = Message::where("group_id", $group->id)->latest()->paginate(10);

        return inertia("Dashboard", [
            "messages" => MessageResource::collection($messages),
            "selected_conversation" => $group->toConversationArray(),
        ]);
    }
}