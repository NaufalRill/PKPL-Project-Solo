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
        Schema::create('faq_groups', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->string('name');
            $table->integer('index');
            $table->foreignUlid('website_id')->constrained('websites')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('faqs', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->string('question');
            $table->string('answer');
            $table->integer('index');
            $table->integer('group_index');
            $table->foreignUlid('website_id')->constrained('websites')->cascadeOnDelete();
            $table->foreignUlid('group_id')->nullable()->constrained('faq_groups')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faq_groups');
        Schema::dropIfExists('faqs');
    }
};
