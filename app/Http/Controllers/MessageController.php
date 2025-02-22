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
            "selected_conversation" => $group->toConversationArray(),
        ]);
    }

    public function store(MessageRequest $request)
    {
        $data = $request->validated();

        $data['sender_id'] = $request->user()->id;
        $group_id = $data['group_id'] ?? null;
        $conversation_id = $data['conversation_id'] ?? null;

        $message = Message::create($data);

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
}