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
        Schema::create('websites', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->string('name');
            $table->string('url');
            $table->smallInteger('faq_display_mode');
            $table->smallInteger('external_link_display_mode');
            $table->timestamp('deployed_at');
            $table->string('order_number');
            $table->timestamps();
        });

        Schema::create('website_features', function (Blueprint $table) {
            $table->string('id')->primary()->unique();
            $table->json('name');
        });

        Schema::create('website_has_features', function (Blueprint $table) {
            $table->foreignUlid('website_id')->constrained('websites')->cascadeOnDelete();

            $table->string('feature_id');
            $table->foreign('feature_id')->references('id')->on('website_features')->cascadeOnDelete();

            $table->primary(['website_id', 'feature_id']);
            $table->index(['website_id', 'feature_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('websites');
        Schema::dropIfExists('website_features');
        Schema::dropIfExists('website_has_features');
    }
};
