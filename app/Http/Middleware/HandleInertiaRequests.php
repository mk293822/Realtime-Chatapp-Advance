<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use App\Models\Conversation;
use App\Models\DeletedMessage;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = Auth::user();
        $allUsers = User::all();
        if ($user) {

            $conversations = Conversation::getConversationsForSidebar($user);

            $is_conversation = $conversations->where("is_conversation", true)->where("accept", true)->pluck("id")->toArray();
            $is_group = $conversations->where("is_group", true)->where("accept", true)->pluck("id")->toArray();

            $all_users = User::where("id", "!=", $user->id ?? 0)->whereNotIn('id', $is_conversation)->get();
            $all_groups = Group::whereNotIn('id', $is_group)->get();


            $all_conversations = $all_users->map(function ($user) {
                return $user->toInertiaArray();
            })->concat($all_groups->map(function ($group) {
                return $group->toInertiaArray();
            }));

            return [
                ...parent::share($request),
                'auth' => [
                    'user' => $user,
                ],
                'conversations' => $conversations,
                'all_conversations' => $all_conversations,
                'allUsers' => UserResource::collection($allUsers),
            ];
        }
        return [...parent::share($request),];
    }
}