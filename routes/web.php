<?php

use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserConversationsStatusController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/last-active-time/{user}', [ProfileController::class, 'lastActiveTime'])->name('user.lastActiveTime');

    Route::post("/user_conversation_status", [UserConversationsStatusController::class, "status"])->name("user_conversation.status");

    Route::get('/private/{user}', [MessageController::class, 'conversation'])->name('message.conversation');
    Route::get('/group/{group}', [MessageController::class, 'group'])->name('message.group');

    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
    Route::post('/message', [MessageController::class, 'store'])->name('message.store');
    Route::post('/message/{message}', [MessageController::class, 'save'])->name('message.save');
    Route::get('/message/{message}', [MessageController::class, 'loadMoreMessage'])->name('message.loadMoreMessage');
    Route::get('/message', [MessageController::class, 'savedMessages'])->name('message.saved_messages');

    Route::post('/conversation', [ConversationController::class, 'block'])->name('conversation.block');
});


Route::middleware('auth')->group(function () {
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post("/profile/dark_mode/{user}", [ProfileController::class, 'darkMode'])->name('user.dark_mode');
});

require __DIR__ . '/auth.php';