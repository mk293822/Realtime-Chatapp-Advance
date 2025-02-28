<?php

namespace App\Http\Controllers;

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

        $update_conversation = Conversation::where("id", $conversation_id)->first();

        $update_conversation->blocked_by = $user_id;
        $update_conversation->block = !$update_conversation->block;
        $update_conversation->save();

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