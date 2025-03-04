<?php

namespace App\Observers;

use App\Models\Conversation;
use App\Models\DeletedMessage;
use App\Models\Group;
use App\Models\Message;
use App\Models\SavedMessages;
use Illuminate\Support\Facades\Storage;

class MessageObserver
{
    public function deleting(Message $message)
    {

        $is_saved = $message->saved_message()->exists();

        $message->attachments()->each(function ($attachment) {
            $path = dirname($attachment->path);
            Storage::disk('public')->deleteDirectory($path);
        });

        $deleted_message_cons = DeletedMessage::where("message_id", $message->id)->get();

        if ($deleted_message_cons) {
            $deleted_message_cons->each->delete();
        }

        $message->attachments()->delete();

        if (!$is_saved) {
            if ($message->group_id) {
                $group = Group::where("last_message_id", $message->id)->first();
                if ($group) {
                    $pre_message = Message::where('group_id', $message->group_id)->where("id", "!=", $message->id)->latest()->limit(1)->first();
                    if ($pre_message) {
                        $group->last_message_id = $pre_message->id;
                        $group->save();
                    }
                }
            } else {
                $conversation = Conversation::where("last_message_id", $message->id)->first();
                if ($conversation) {
                    $pre_message = Message::where('conversation_id', $message->conversation_id)->where("id", "!=", $message->id)->latest()->limit(1)->first();
                    if ($pre_message) {
                        $conversation->last_message_id = $pre_message->id;
                        $conversation->save();
                    }
                }
            }
        }
    }
}