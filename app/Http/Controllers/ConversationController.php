<?php

namespace App\Http\Controllers;

use App\Events\ConversationStatusSockets;
use App\Models\Conversation;
use App\Models\Group;
use Illuminate\Http\Request;

class ConversationController extends Controller
{



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function block(Request $request)
    {
        $conversation_id = $request->input("conversation_id");
        $user_id = $request->user()->id;
        $status = "block";

        $update_conversation = Conversation::where("id", $conversation_id)->first();

        if ($update_conversation->block) {
            if ($update_conversation->blocked_by === $user_id) {
                $update_conversation->block = false;
                $update_conversation->blocked_by = null;
                $update_conversation->save();
                ConversationStatusSockets::dispatch($update_conversation, $status);

                return response()->json(["conversation" => $update_conversation]);
            } else {
                abort(403, 'Access Denied');
            }
        }

        $update_conversation->blocked_by = $user_id;
        $update_conversation->block = !$update_conversation->block;
        $update_conversation->save();

        ConversationStatusSockets::dispatch($update_conversation, $status);

        return response()->json(["conversation" => $update_conversation]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Conversation $conversation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Conversation $conversation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Conversation $conversation)
    {
        //
    }
}