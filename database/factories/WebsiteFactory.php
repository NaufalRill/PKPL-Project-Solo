<?php

namespace Database\Factories;

use App\Models\ExternalLink;
use App\Models\Faq;
use App\Models\Website;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Website>
 */
class WebsiteFactory extends Factory
{
    protected $model = Website::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'url' => fake()->url(),
            'faq_display_mode' => Faq::DISPLAY_MODE_SINGLE,
            'external_link_display_mode' => ExternalLink::DISPLAY_MODE_SINGLE,
            'deployed_at' => now(),
            'order_number' => fake()->uuid(),
        ];
    }

    protected static function newFactory()
    {
        return WebsiteFactory::new();
    }
}
