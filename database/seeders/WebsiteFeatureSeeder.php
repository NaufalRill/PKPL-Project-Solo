<?php

namespace Database\Seeders;

use App\Models\WebsiteFeature;
use Illuminate\Database\Seeder;

class WebsiteFeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (WebsiteFeature::count() === 0) {
            WebsiteFeature::create([
                'id' => WebsiteFeature::BLOG,
                'name' => [
                    'en' => 'Blog',
                    'id' => 'Blog',
                ],
            ]);
            WebsiteFeature::create([
                'id' => WebsiteFeature::EXTERNAL_LINK,
                'name' => [
                    'en' => 'External Link',
                    'id' => 'Tautan Eksternal',
                ],
            ]);
            WebsiteFeature::create([
                'id' => WebsiteFeature::FAQ,
                'name' => [
                    'en' => 'FAQ',
                    'id' => 'FAQ',
                ],
            ]);
            WebsiteFeature::create([
                'id' => WebsiteFeature::FORM,
                'name' => [
                    'en' => 'Form',
                    'id' => 'Form',
                ],
            ]);
        }
    }
}
