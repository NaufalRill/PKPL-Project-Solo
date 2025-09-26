<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class WebsiteFeature extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    public $timestamps = false;

    const BLOG = 'blog';

    const EXTERNAL_LINK = 'external-link';

    const FAQ = 'faq';

    const FORM = 'form';

    protected function casts(): array
    {
        return [
            'name' => 'json:unicode',
        ];
    }
}
