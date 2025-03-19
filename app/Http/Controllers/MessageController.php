<?php

namespace App\Http\Controllers;

use App\Events\MessageSend;
use App\Http\Requests\MessageRequest;
use App\Http\Resources\CallMessageResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\MessageSavedConversationResource;
use App\Models\CallMessage;
use App\Models\Conversation;
use App\Models\DeletedMessage;
use App\Models\Group;
use App\Models\GroupUsers;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\MessageSavedConversation;
use App\Models\SavedMessages;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use function PHPUnit\Framework\isEmpty;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function conversation(User $user)
    {
        $self_id = Auth::id();
        $messages = Message::where('receiver_id', $user->id)
            ->where('sender_id', $self_id)
            ->orWhere('sender_id', $user->id)
            ->where('receiver_id', $self_id)
            ->latest()
            ->paginate(10);

        $deleted_messages = DeletedMessage::where('user_id', $self_id)->pluck("message_id")->toArray();

        if (!empty($deleted_messages)) {
            $messages = $messages->filter(function ($message) use ($deleted_messages) {
                return !in_array($message->id, $deleted_messages);
            });
        }


        return inertia("Dashboard", [
            "messages" => MessageResource::collection($messages),
            "selected_conversation" => User::toSelectedConversation($user),
        ]);
    }

    public function message_saved_conversation()
    {
        $user_id = Auth::id();

        $message_save_conversation = MessageSavedConversation::where("saved_by", $user_id)->first();

        if (!$message_save_conversation) {
            $message_save_conversation = MessageSavedConversation::create([
                "saved_by" => $user_id,
            ]);
        }

        $message_ids = SavedMessages::where("save_conversation_id", $message_save_conversation->id)
            ->latest()->pluck("message_id")->toArray();


        $messages = [];

        foreach ($message_ids as $mes_id) {
            $messages[] = Message::where("id", $mes_id)->first();
        }

        // dd($message_ids, $messages);

        return inertia("Dashboard", [
            "messages" => MessageResource::collection($messages),
            "selected_conversation" => new MessageSavedConversationResource($message_save_conversation),
        ]);
    }

    public function group(Group $group)
    {
        $self_id = Auth::id();
        $messages = Message::where("group_id", $group->id)->latest()->paginate(10);

        $deleted_messages = DeletedMessage::where('user_id', $self_id)->pluck("message_id")->toArray();

        if (!empty($deleted_messages)) {
            $messages = $messages->filter(function ($message) use ($deleted_messages) {
                return !in_array($message->id, $deleted_messages);
            });
        }

        return inertia("Dashboard", [
            "messages" => MessageResource::collection($messages),
            "selected_conversation" => Group::toSelectedConversationArray($group),
        ]);
    }

    public function store(MessageRequest $request)
    {
        $data = $request->validated();

        $data['sender_id'] = $request->user()->id;
        $group_id = $data['group_id'] ?? null;
        $conversation_id = $data['conversation_id'] ?? null;
        $save_conversation_id = $data['save_conversation_id'] ?? null;
        $receiver_id = $data['receiver_id'] ?? null;

        if ($receiver_id == null && $conversation_id) {
            $conversation = Conversation::where("id", $conversation_id)->first();
            $data['receiver_id'] = $conversation->user_id1 == $request->user()->id ? $conversation->user_id2 : $conversation->user_id1;
        }

        $message = Message::create($data);

        $pre_message = Message::where('created_at', "<", $message->created_at)->latest()->first();

        if ($pre_message) {
            $diffInMilliseconds = $pre_message->created_at->diffInMilliseconds($message->created_at);
            if ($diffInMilliseconds > 900000) {
                $message->last_send_date = $message->created_at;
                $message->save();
            }
        }

        $files = $data['attachments'] ?? [];

        if ($files) {
            $attachments = [];
            foreach ($files as $file) {
                $directory = "attachments/" . Str::random(32);
                Storage::makeDirectory($directory);
                $filePath = $file->store($directory, 'public');

                $model = [
                    "message_id" => $message->id,
                    "name" => $file->getClientOriginalName(),
                    "size" => $file->getSize(),
                    "mime" => $file->getClientMimeType(),
                    "path" => $filePath,
                ];
                $attachment = MessageAttachment::create($model);
                $attachments[] = $attachment;
            }
            $message->attachments()->saveMany($attachments);
        }

        $type = $data["type"] ?? null;

        if ($type) {
            $video = $data["payload"];
            $accept = match ($type) {
                "call_end" => true,
                "call_reject" => false,
                default => false,
            };

            if ($accept !== null && $type !== "call_request") {
                CallMessage::create([
                    "message_id" => $message->id,
                    "accept" => $accept,
                    "is_video" => $video === "true" ? 1 : 0,
                    "period" => $data['timer'] ?? null,
                ]);
            }
        }


        if ($save_conversation_id) {
            SavedMessages::create([
                "message_id" => $message->id,
                "save_conversation_id" => $save_conversation_id
            ]);
        } else {
            if ($group_id) {
                Group::where('id', $group_id)->update([
                    'last_message_id' => $message->id,
                ]);
            }

            if ($conversation_id) {
                Conversation::where("id", $conversation_id)->update([
                    "last_message_id" => $message->id,
                ]);
            }

            $status = "send";

            MessageSend::dispatch($message, $status, null);
        }
        return response()->json(["message" => new MessageResource($message)]);
    }

    public function loadMoreMessage(Request $request, $message_id)
    {

        $is_save_conversation = $request->query("is_save_conversation");
        $self_id = Auth::id();

        $mes = null;

        if ($is_save_conversation === "true") {
            $saved_message = SavedMessages::where('message_id', $message_id)->first();

            $save_message_con_id = MessageSavedConversation::where("saved_by", $self_id)->first()->id;

            $saved_messages = SavedMessages::where("save_conversation_id", $save_message_con_id)
                ->where('created_at', '<', $saved_message->created_at)
                ->pluck("message_id")->toArray();

            $mes = Message::whereIn("id", $saved_messages)
                ->where("id", "!=", $message_id)
                ->latest()->paginate(10);
        } else {

            $message = Message::where('id', $message_id)->first();

            if ($message->group_id) {
                $mes = Message::where('created_at', '<', $message->created_at)
                    ->where('group_id', $message->group_id)
                    ->latest()
                    ->paginate(10);
            } else {
                $mes = Message::where('created_at', '<', $message->created_at)
                    ->where(function ($query) use ($message) {
                        $query->where('sender_id', $message->sender_id)
                            ->where('receiver_id', $message->receiver_id)
                            ->orWhere('sender_id', $message->receiver_id)
                            ->where('receiver_id', $message->sender_id);
                    })
                    ->latest()
                    ->paginate(10);
            }

            $deleted_messages = DeletedMessage::where('user_id', $self_id)->pluck("message_id")->toArray();

            if (!empty($deleted_messages)) {
                $mes = $mes->filter(function ($message) use ($deleted_messages) {
                    return !in_array($message->id, $deleted_messages);
                });
            }
        }


        $messages = MessageResource::collection($mes);

        if (!$messages->isEmpty()) return response()->json(["messages" => $messages]);
        if ($messages->isEmpty()) {
            return response()->json(["messages" => "noMoreMessages"]);
        }
    }

    public function destroy(Message $message)
    {
        $group = null;
        $conversation = null;

        if ($message->group_id) {
            $group = Group::where('last_message_id', $message->id)->first();
        } else {
            $conversation = Conversation::where('last_message_id', $message->id)->first();
        }

        $is_saved = $message->saved_message()->exists();

        if (!$is_saved) {
            $message->delete();
        } else {
            $this->destroy_for_saved_message($message);
        }


        $status = "delete";

        $deleted_message = $message;
        $lastMessage = null;


        if ($group) {
            $group->refresh();
            $lastMessage = Message::find($group->last_message_id);
        }

        if ($conversation) {
            $conversation->refresh();
            $lastMessage = Message::find($conversation->last_message_id);
        }

        MessageSend::dispatch($deleted_message, $status, $lastMessage);

        $pre = $this->get_undeleted_pre_message($lastMessage);

        return response()->json(["deleted_message" => $deleted_message, "pre_message" => $pre]);
    }

    public function deleted_for_user(Message $message, $user = null)
    {
        $user ??= Auth::user();
        $all_users_deleted = false;

        DeletedMessage::create([
            "message_id" => $message->id,
            "user_id" => $user->id,
        ]);

        $all_users_deleted = $this->is_deleted_for_all_users($message);
        $is_saved = $message->saved_message()->exists();

        if ($all_users_deleted && !$is_saved) {
            return $this->destroy($message);
        }

        Log::info("message", [$all_users_deleted, $is_saved]);

        if ($is_saved && $all_users_deleted) {
            $pre_message = $this->update_the_pre_message($message);
        } else {

            $deleted_message_ids = $user->deleted_messages->pluck("message_id")->toArray();

            $pre_message = Message::where(function ($query) use ($message) {
                if ($message->conversation_id) {
                    $query->where("conversation_id", $message->conversation_id);
                } else {
                    $query->where("group_id", $message->group_id);
                }
            })
                ->where("id", "!=", $message->id)
                ->whereNotIn("id",  $deleted_message_ids)
                ->latest()
                ->limit(1)
                ->first();
        }


        return response()->json(["deleted_message" => $message, "pre_message" => $pre_message]);
    }

    protected function get_undeleted_pre_message($message)
    {
        $user = Auth::user();

        $deleted_message_ids = $user->deleted_messages->pluck("message_id")->toArray();

        $pre_message = Message::where(function ($query) use ($message) {
            if ($message->group_id) {
                $query->where("group_id", $message->group_id);
            } else {
                $query->where("conversation_id", $message->conversation_id);
            }
        })
            ->whereNotIn("id", $deleted_message_ids)
            ->where("id", "<", $message->id)
            ->latest()
            ->first();

        return $pre_message;
    }

    protected function destroy_for_saved_message(Message $message)
    {
        $this->update_the_pre_message($message);

        if ($message->group_id) {

            $group_users = $message->group_users;

            foreach ($group_users as $user) {
                $this->delete_for_each_user($message, $user->user);
            }
        } else {

            $conversation = Conversation::where("id", $message->conversation_id)->first();

            $this->delete_for_each_user($message, $conversation->user1);
            $this->delete_for_each_user($message, $conversation->user2);
        }
    }

    protected function delete_for_each_user(Message $message, $user = null)
    {
        $already_deleted = DeletedMessage::where("user_id", $user->id)
            ->where("message_id", $message->id)->first() ? true : false;

        if (!$already_deleted) {
            DeletedMessage::create([
                "message_id" => $message->id,
                "user_id" => $user->id,
            ]);
        }
    }

    protected function update_the_pre_message(Message $message)
    {
        if ($message->group_id) {
            $pre_message = null;

            $group_for_last = Group::where("last_message_id", $message->id)->first();

            if ($group_for_last) {

                $pre_message = Message::where('group_id', $message->group_id)
                    ->where("id", "!=", $message->id)
                    ->latest()
                    ->first();

                while ($pre_message && $this->is_deleted_for_all_users($pre_message)) {
                    $pre_message = Message::where('group_id', $message->group_id)
                        ->where('created_at', '<', $pre_message->created_at)
                        ->latest('created_at')
                        ->first();
                }

                if ($pre_message) {
                    $group_for_last->last_message_id = $pre_message->id;
                    $group_for_last->save();
                }
            }
            return $pre_message;
        } else {
            $pre_message = null;

            $conversation_for_last = Conversation::where("last_message_id", $message->id)->first();

            if ($conversation_for_last) {
                $pre_message = Message::where('conversation_id', $message->conversation_id)->where("id", "!=", $message->id)->latest()->limit(1)->first();

                while ($pre_message && $this->is_deleted_for_all_users($pre_message)) {
                    $pre_message = Message::where('conversation_id', $message->conversation_id)
                        ->where('created_at', '<', $pre_message->created_at)
                        ->latest('created_at')
                        ->first();
                }

                if ($pre_message) {
                    $conversation_for_last->last_message_id = $pre_message->id;
                    $conversation_for_last->save();
                }
            }
            return $pre_message;
        }
    }

    protected function is_deleted_for_all_users(Message $message)
    {
        $is_deleted = false;


        if ($message->conversation_id) {

            $is_deleted = DeletedMessage::where('message_id', $message->id)
                ->whereIn('user_id', [$message->sender_id, $message->receiver_id])
                ->count() === 2;
        } else if ($message->group_id) {

            $group_user_ids = GroupUsers::where("group_id", $message->group_id)
                ->pluck("user_id")
                ->toArray();

            $deleted_messages_count = DeletedMessage::where("message_id", $message->id)
                ->whereIn("user_id", $group_user_ids)
                ->count();

            $is_deleted = count($group_user_ids) === $deleted_messages_count;
        } else {
            $is_deleted = true;
        }


        return $is_deleted;
    }

    public function save(Message $message)
    {
        $user = Auth::user();

        $message_save_conversation = $user->message_save_conversation;

        if (!$message_save_conversation) {
            $message_save_conversation = MessageSavedConversation::create([
                "saved_by" => $user->id,
            ]);
        }

        SavedMessages::create([
            "message_id" => $message->id,
            "save_conversation_id" => $message_save_conversation->id,
        ]);

        return response()->json([
            "message" => new MessageResource($message),
            "saved" => true
        ]);
    }

    public function unsave(Message $message)
    {
        $user = Auth::user();
        $unsave_mes = $message;

        $is_deleted_for_all = $this->is_deleted_for_all_users($message);

        $message_save_con = $user->message_save_conversation;

        $unsaved_message = SavedMessages::where("save_conversation_id", $message_save_con->id)
            ->where("message_id", $message->id)->first();

        $unsaved_message->delete();

        $is_many_saved = $message->saved_message()->exists();

        if (!$is_many_saved && $is_deleted_for_all) {
            $message->delete();
        }

        return response()->json([
            "message" => new MessageResource($unsave_mes),
            "saved" => false
        ]);
    }
}