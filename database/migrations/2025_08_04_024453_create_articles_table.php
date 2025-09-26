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
        Schema::create('articles', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->smallInteger('status');
            $table->foreignUlid('website_id')->constrained('websites')->cascadeOnDelete();
            $table->foreignUlid('created_by')->nullable();
            $table->foreignUlid('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::create('article_localizations', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->string('lang', 5);
            $table->string('title');
            $table->string('slug')->unique();
            $table->json('content');
            $table->json('tags');
            $table->foreignUlid('article_id')->constrained('articles')->cascadeOnDelete();
        });

        Schema::create('article_tags', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->string('name');
            $table->foreignUlid('website_id')->constrained('websites')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
        Schema::dropIfExists('article_localizations');
        Schema::dropIfExists('article_tags');
    }
};
