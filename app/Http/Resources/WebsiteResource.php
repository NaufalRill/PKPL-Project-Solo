<?php

namespace App\Http\Resources;

use App\Models\Client;
use App\Models\ExternalLink;
use App\Models\Faq;
use App\Models\Role;
use App\Models\WebsiteFeature;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebsiteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->url,
            'status' => $this->status(),
            'faqDisplayMode' => $this->faq_display_mode == Faq::DISPLAY_MODE_SINGLE ? 'single' : 'group',
            'externalLinkDisplayMode' => $this->external_link_display_mode == ExternalLink::DISPLAY_MODE_SINGLE ? 'single' : 'group',
            'features' => $this->features->map(function (WebsiteFeature $feature) {
                return $feature->id;
            }),
        ];

        $user = $request->user();

        if ($user->hasRole(Role::ADMIN)) {
            $data = [
                ...$data,
                'clients' => $this->clients->map(function (Client $client) {
                    return [
                        'id' => $client->id,
                        'name' => $client->user->name,
                    ];
                }),
                'deployedAt' => $this->deployed_at,
                'orderNumber' => $this->order_number,
                'createdAt' => $this->created_at,
                'updatedAt' => $this->updated_at,
            ];
        }

        return $data;
    }
}
