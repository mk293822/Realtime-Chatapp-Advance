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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id1')->constrained('users')->cascadeOnDelete();
            $table->foreignId('user_id2')->constrained('users')->cascadeOnDelete();
            $table->foreignId('request_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('status_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->boolean('accept')->default(false);
            $table->boolean('reject')->default(false);
            $table->boolean('pending')->default(false);
            $table->boolean('block')->default(false);
            $table->timestamp('status_at')->nullable();
            $table->foreignId("blocked_by")->nullable()->constrained("users");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
