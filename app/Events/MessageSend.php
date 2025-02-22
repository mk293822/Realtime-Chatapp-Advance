<?php

namespace App\Events;

use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSend implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $message, public $status, public $preMessage)
    {
        //
    }

    public function broadcastWith()
    {
        return [
            "message" => new MessageResource($this->message),
            'status' => $this->status,
            'preMessage' => $this->preMessage,
        ];
    }
    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $mes = $this->message;
        $channel = [];

        if ($mes->group_id) {
            $channel[] = new PrivateChannel("message.group." . $mes->group_id);
        }
        if ($mes->conversation_id) {
            $channel[] = new PrivateChannel("message.conversation." . collect([$mes->sender_id, $mes->receiver_id])->sort()->implode('-'));
        }

        return $channel;
    }
}