<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'conversation_id' => $this->conversation_id,
            'group_id' => $this->group_id,
            'sender_id' => $this->sender_id,
            'receiver_id' => $this->receiver_id,
            'attachments' => $this->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'name' => $attachment->name,
                    'mime' => $attachment->mime,
                    'size' => $attachment->size,
                    'path' => $attachment->path
                ];
            })
        ];
    }
}