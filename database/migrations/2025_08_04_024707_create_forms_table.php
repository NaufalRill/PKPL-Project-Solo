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
        Schema::create('forms', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->foreignUlid('website_id')->constrained('websites')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('form_fields', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->integer('type');
            $table->boolean('is_required');
            $table->integer('index');
            $table->double('min_value')->nullable()->default(0);
            $table->double('max_value')->nullable()->default(0);
            $table->integer('min_digits')->nullable()->default(0);
            $table->integer('max_digits')->nullable()->default(0);
            $table->boolean('is_randomized')->nullable()->default(false);
            $table->boolean('is_multiple')->nullable()->default(false);
            $table->boolean('use_country_code')->nullable()->default(false);
            $table->foreignUlid('form_id')->constrained('forms')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('form_submissions', function (Blueprint $table) {
            $table->ulid('id')->primary()->unique();
            $table->string('ip', 15);
            $table->foreignUlid('form_id')->constrained('forms')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('form_fields_submissions', function (Blueprint $table) {
            $table->foreignUlid('submission_id')->constrained('form_submissions')->cascadeOnDelete();
            $table->foreignUlid('field_id')->constrained('form_fields')->cascadeOnDelete();

            $table->integer('field_type');
            $table->json('value');

            $table->primary(['submission_id', 'field_id']);
            $table->index(['submission_id', 'field_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
        Schema::dropIfExists('form_fields');
        Schema::dropIfExists('form_submissions');
        Schema::dropIfExists('form_fields_submissions');
    }
};
