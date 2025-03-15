<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public static $wrap = false;
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
            'group_id' => $this->group_id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'sender' => new UserResource($this->sender),
            'receiver_id' => $this->receiver_id,
            'attachments' => AttachmentResource::collection($this->attachments),
            'created_at' => $this->created_at . " UTC",
            "last_send_date" => $this->last_send_date,
            'is_saved' => $this->saved_message()->exists(),
            'call_message' =>  new CallMessageResource($this->call_message),
        ];
    }
}