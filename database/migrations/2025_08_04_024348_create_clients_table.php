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
        Schema::create('clients', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->string('contact');
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('client_has_websites', function (Blueprint $table) {
            $table->foreignUlid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUlid('website_id')->constrained('websites')->cascadeOnDelete();

            $table->primary(['client_id', 'website_id']);
            $table->index(['client_id', 'website_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
        Schema::dropIfExists('client_has_websites');
    }
};
