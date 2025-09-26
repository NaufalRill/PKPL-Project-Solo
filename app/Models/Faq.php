<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faq extends Model
{
    use HasUlids;

    const DISPLAY_MODE_SINGLE = 0;

    const DISPLAY_MODE_GROUP = 1;

    public function group(): BelongsTo
    {
        return $this->belongsTo(FaqGroup::class, 'group_id', 'id');
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class, 'website_id', 'id');
    }
}
