<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CallMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "message_id" => $this->message_id,
            "is_video" => $this->is_video === 1 ?? false,
            "accept" => $this->accept === 1 ?? false,
            "period" => $this->period,
            "created_at" => $this->created_at
        ];
    }
}