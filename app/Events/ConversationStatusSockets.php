<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationStatusSockets implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Conversation $conversation, public $status, public $sender, public $receiver)
    {
        //
    }

    public function broadcastWith()
    {
        return [
            "conversation" => $this->conversation,
            "status" => $this->status,
            "sender" => $this->sender,
            "receiver" => $this->receiver,
        ];
    }

    /**
     * Get the channels the event should broadcast on.```php

     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        $conversation = $this->conversation;
        $status = $this->status;
        $sender = $this->sender;
        $receiver = $this->receiver;

        if ($status === "create") {
            $channels[] = new PrivateChannel("conversation." . collect([$sender->id, $receiver->id])->sort()->implode("-"));
        } else {
            $channels[] = new PrivateChannel("conversation.{$conversation->id}");
        }

        return $channels;
    }
}