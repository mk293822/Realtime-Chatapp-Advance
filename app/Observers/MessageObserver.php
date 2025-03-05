<?php

namespace App\Observers;

use App\Models\Conversation;
use App\Models\DeletedMessage;
use App\Models\Group;
use App\Models\GroupUsers;
use App\Models\Message;
use App\Models\SavedMessages;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MessageObserver
{
    public function deleting(Message $message)
    {

        $message->attachments()->each(function ($attachment) {
            $path = dirname($attachment->path);
            Storage::disk('public')->deleteDirectory($path);
        });

        $deleted_message_cons = DeletedMessage::where("message_id", $message->id)->get();

        if ($deleted_message_cons) {
            $deleted_message_cons->each->delete();
        }

        $message->attachments()->delete();

        if ($message->group_id) {
            $group = Group::where("last_message_id", $message->id)->first();
            if ($group) {
                $pre_message = Message::where('group_id', $message->group_id)->where("id", "!=", $message->id)->latest()->limit(1)->first();

                while ($pre_message && $this->is_deleted_for_all_users($pre_message)) {
                    $pre_message = Message::where('group_id', $message->group_id)
                        ->where('created_at', '<', $pre_message->created_at)
                        ->latest('created_at')
                        ->first();
                }

                if ($pre_message) {
                    $group->last_message_id = $pre_message->id;
                    $group->save();
                }
            }
        } else {
            $conversation = Conversation::where("last_message_id", $message->id)->first();
            if ($conversation) {
                $pre_message = Message::where('conversation_id', $message->conversation_id)
                    ->where("id", "!=", $message->id)->latest()->limit(1)->first();

                while ($pre_message && $this->is_deleted_for_all_users($pre_message)) {
                    $pre_message = Message::where('conversation_id', $message->conversation_id)
                        ->where('created_at', '<', $pre_message->created_at)
                        ->latest('created_at')
                        ->first();
                }


                if ($pre_message) {
                    $conversation->last_message_id = $pre_message->id;
                    $conversation->save();
                }
            }
        }
    }
    protected function is_deleted_for_all_users(Message $message)
    {
        $is_deleted = false;

        $is_save = SavedMessages::where("message_id", $message->id)->first() ? true : false;

        if ($is_save) {
            if ($message->conversation_id) {
                $is_deleted = DeletedMessage::where('message_id', $message->id)
                    ->whereIn('user_id', [$message->sender_id, $message->receiver_id])
                    ->count() === 2;
            } else {

                $group_user_ids = GroupUsers::where("group_id", $message->group_id)
                    ->pluck("user_id")
                    ->toArray();

                $deleted_messages_count = DeletedMessage::where("message_id", $message->id)
                    ->whereIn("user_id", $group_user_ids)
                    ->count();

                $is_deleted = count($group_user_ids) === $deleted_messages_count;
            }
        } else {
            $is_deleted = false;
        }

        return $is_deleted;
    }
}