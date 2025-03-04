<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('message_saved_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saved_by')->unique()->constrained("users")->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('saved_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('save_conversation_id')->constrained("users")->cascadeOnDelete();
            $table->foreignId("message_id")->constrained("messages")->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_saved_conversations');
        Schema::dropIfExists('saved_messages');
    }
};