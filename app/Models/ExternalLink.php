<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class ExternalLink extends Model implements HasMedia
{
    use HasUlids, InteractsWithMedia;

    /** Pastikan primary key ULID terset string & non-increment */
    public $incrementing = false;

    protected $keyType = 'string';

    /** (opsional) kalau nama tabel tidak standar */
    protected $table = 'external_links';

    /** Biar mass assign bisa jalan */
    protected $fillable = [
        'website_id',
        'group_id',
        'label',
        'url',
        'index',
        'group_index',
    ];

    /** Samakan dengan Faq: index & group_index integer */
    protected $casts = [
        'index' => 'integer',
        'group_index' => 'integer',
    ];

    /** Default untuk single mode agar tidak NULL (hindari NOT NULL error) */
    protected $attributes = [
        'group_index' => 0,
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(ExternalLinkGroup::class, 'group_id', 'id');
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class, 'website_id', 'id');
    }
}
