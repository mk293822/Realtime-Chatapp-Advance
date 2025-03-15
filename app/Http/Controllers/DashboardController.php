<?php

namespace App\Http\Controllers;

use App\Events\MessageSend;
use App\Events\WebRTCEvent;
use App\Http\Requests\MessageRequest;
use App\Models\CallMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class DashboardController extends Controller
{

    protected $messageController;

    public function __construct(MessageController $messageController)
    {
        $this->messageController = $messageController;
    }

    public function index(Request $request)
    {
        return Inertia::render("Dashboard");
    }

    public function call_room(Request $request, User $user, MessageController $messageController)
    {
        return Inertia::render("WebRTC", [
            "conversation" => $user->toSelectedConversation(),
            "is_video" => filter_var($request->get('video', false), FILTER_VALIDATE_BOOLEAN),

        ]);
    }

    public function call_request(Request $request, User $user, MessageController $messageController)
    {
        $self = Auth::user();
        $payload = $request->input("payload") ?? null;
        $type = $request->input("type");


        broadcast(new WebRTCEvent($type, $payload, $user->id, $self->id))->toOthers();
    }
}