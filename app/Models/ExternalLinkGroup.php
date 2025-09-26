<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExternalLinkGroup extends Model
{
    use HasUlids;

    /** Samakan dengan FaqGroup (ULID) */
    public $incrementing = false;

    protected $keyType = 'string';

    /** (opsional) jika nama tabel berbeda */
    protected $table = 'external_link_groups';

    protected $fillable = [
        'website_id',
        'name',
        'index',
    ];

    protected $casts = [
        'index' => 'integer',
    ];

    /** Urutkan item default-nya by group_index lalu index */
    public function links(): HasMany
    {
        return $this->hasMany(ExternalLink::class, 'group_id', 'id')
            ->orderBy('group_index')
            ->orderBy('index');
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class, 'website_id', 'id');
    }
}
