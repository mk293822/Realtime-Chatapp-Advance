<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WebRTCEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;



    /**
     * Create a new event instance.
     */
    public function __construct(
        public $type,
        public $payload,
        public $receiverId,
        public $senderId,
    ) {
        //
    }

    public function broadcastWith()
    {
        return [
            "type" => $this->type,
            "payload" => $this->payload,
            "receiverId" => $this->receiverId,
            "senderId" => $this->senderId,
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("private.call." . collect([$this->senderId, $this->receiverId])->sort()->implode("-")),
        ];
    }
}