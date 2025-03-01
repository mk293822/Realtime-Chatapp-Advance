<?php

namespace App\Http\Controllers;

use App\Events\MessageSend;
use App\Http\Requests\MessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
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

        return inertia("Dashboard", [
            "messages" => MessageResource::collection($messages),
            "selected_conversation" => $user->toSelectedConversation(),
        ]);
    }

    public function group(Group $group)
    {
        $messages = Message::where("group_id", $group->id)->latest()->paginate(10);

        return inertia("Dashboard", [
            "messages" => MessageResource::collection($messages),
            "selected_conversation" => $group->toSelectedConversationArray(),
        ]);
    }

    public function store(MessageRequest $request)
    {
        $data = $request->validated();

        $data['sender_id'] = $request->user()->id;
        $group_id = $data['group_id'] ?? null;
        $conversation_id = $data['conversation_id'] ?? null;

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

        return new MessageResource($message);
    }

    public function destroy(Message $message)

    {
        if ($message->sender_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $group = null;
        $conversation = null;

        if ($message->group_id) {
            $group = Group::where('last_message_id', $message->id)->first();
        } else {
            $conversation = Conversation::where('last_message_id', $message->id)->first();
        }

        $status = "delete";

        $deleted_message = $message;

        $message->delete();
        $lastMessage = null;

        if ($group) {
            $group = Group::find($group->id);
            $lastMessage = $group->lastMessage;
        }
        if ($conversation) {
            $conversation = Conversation::find($conversation->id);
            $lastMessage = $conversation->lastMessage;
        }

        MessageSend::dispatch($deleted_message, $status, $lastMessage);

        return response()->json(['message' => $lastMessage !== null ? new MessageResource($lastMessage) : null], 200);
    }

    public function loadMoreMessage(Message $message)
    {
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

        $messages = MessageResource::collection($mes);

        if (!$messages->isEmpty()) return response()->json(["messages" => $messages]);
        if ($messages->isEmpty()) {
            return response()->json(["messages" => "noMoreMessages"]);
        }
    }

    public function save(Message $message)
    {
        $message->is_saved = !$message->is_saved;
        $message->saved_by = Auth::id();
        $message->save();

        $message->refresh();
        return response()->json(["is_saved" => $message->is_saved === 1 ? true : false]);
    }

    public function savedMessages()
    {
        $user_id = Auth::id();
        $messages = Message::where("is_saved", true)->where("saved_by", $user_id)->get();

        return response()->json(["messages" => MessageResource::collection($messages)]);
    }
}