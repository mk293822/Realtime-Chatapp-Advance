<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageSavedConversationResource extends JsonResource
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
            "id" => $this->id,
            "saved_by" => $this->saved_by,
            "name" => "Saved Messages",
            "avatar" => null,
            "is_save_conversation" => true,
            "is_group" => false,
            "is_conversation" => false,
        ];
    }
}
