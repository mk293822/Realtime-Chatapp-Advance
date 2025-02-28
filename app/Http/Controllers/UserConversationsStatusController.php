<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserConversationsStatusRequest;
use App\Models\UserConversationsStatus;
use Illuminate\Http\Request;

class UserConversationsStatusController extends Controller
{
    public function status(UserConversationsStatusRequest $request)
    {
        $data = $request->validated();
        $status = $data['status'];

        $validStatuses = ['pin', 'archived', 'mute'];
        if (!in_array($status, $validStatuses)) {
            return response()->json(['error' => 'Invalid status provided.'], 400);
        }

        $users_conversation = UserConversationsStatus::where('user_id', $data['user_id'])
            ->where(function ($query) use ($data) {
                if ($data['conversation_id']) {
                    $query->where('conversation_id', $data['conversation_id']);
                } else {
                    $query->where('group_id', $data['group_id']);
                }
            })
            ->first();

        if (!$users_conversation) {
            return response()->json(['error' => 'User conversation not found.'], 404);
        }

        $currentStatus = $users_conversation->$status;

        $users_conversation->setAttribute($status, !$currentStatus);

        $users_conversation->save();

        return response()->json(["status" => [$status => $users_conversation->$status]]);
    }
}