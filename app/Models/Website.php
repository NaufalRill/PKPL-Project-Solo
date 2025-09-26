<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Website extends Model
{
    use HasFactory, HasUlids;

    const STATUS_ACTIVE = 'active';

    const STATUS_INACTIVE = 'inactive';

    protected $fillable = [
        'name', 'url',
        'faq_display_mode', 'external_link_display_mode',
        'deployed_at', 'order_number',
    ];


    protected function casts(): array
    {
        return [
            'deployed_at' => 'datetime',
        ];
    }

    #[Scope]
    protected function smartSearch($query, string $keyword): void
    {
        $words = preg_split('/\s+/', trim($keyword));
        $query->where(function ($q) use ($words) {
            foreach ($words as $word) {
                $q->orWhere('name', 'ILIKE', "%{$word}%");
            }
        });
    }

    public function expiredAt()
    {
        return $this->deployed_at->addYear(1);
    }

    public function status()
    {
        if (Carbon::now()->isAfter($this->expiredAt())) {
            return Website::STATUS_INACTIVE;
        }

        return Website::STATUS_ACTIVE;
    }

    public function features(): BelongsToMany
    {
        return $this->belongsToMany(WebsiteFeature::class, 'website_has_features', 'website_id', 'feature_id');
    }

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(Client::class, 'client_has_websites', 'website_id', 'client_id')->with('user');
    }
}
