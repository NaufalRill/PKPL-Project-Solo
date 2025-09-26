<?php

namespace Database\Seeders;

use App\Models\Website;
use App\Models\WebsiteFeature;
use Illuminate\Database\Seeder;

class WebsiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $websites = Website::factory(5)->create();
        $websites->each(function (Website $website) {
            $website->features()->attach([
                WebsiteFeature::BLOG,
                WebsiteFeature::EXTERNAL_LINK,
                WebsiteFeature::FAQ,
                WebsiteFeature::FORM,
            ]);
        });
    }
}
