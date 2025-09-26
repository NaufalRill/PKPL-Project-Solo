<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Client extends Model
{
    use HasUlids;

    protected $fillable = [
        'contact',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    #[Scope]
    protected function smartSearch($query, string $keyword): void
    {
        $words = preg_split('/\s+/', trim($keyword));
        $query->where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhereHas('user', function ($userQuery) use ($word) {
                    $userQuery->where('name', 'ILIKE', "%{$word}%")
                        ->orWhere('email', 'ILIKE', "%{$word}%");
                });

            }
        });
    }

    public function websites(): BelongsToMany
    {
        return $this->belongsToMany(Website::class, 'client_has_websites', 'client_id', 'website_id');
    }

    public function hasWebsite(string $websiteId)
    {
        return $this->websites()->firstWhere('id', $websiteId) !== null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
