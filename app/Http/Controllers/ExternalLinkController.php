<?php

namespace App\Http\Controllers;

use App\Models\ExternalLink;
use App\Models\ExternalLinkGroup;
use App\Models\Website;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ExternalLinkController extends Controller
{
    public function index(Request $request, Website $website)
    {
        // Link single (tanpa group)
        $singles = ExternalLink::query()
            ->where('website_id', $website->id)
            ->whereNull('group_id')
            ->orderBy('index')
            ->get(['id', 'label', 'url', 'group_id'])
            ->map(fn ($m) => [
                'id' => $m->id,
                'label' => $m->label,
                'url' => $m->url,
                'group_id' => $m->group_id, // null
            ])
            ->values();

        // Semua grup + items
        $groups = ExternalLinkGroup::query()
            ->where('website_id', $website->id)
            ->orderBy('index')
            ->get(['id', 'name'])
            ->map(function ($g) use ($website) {
                $items = ExternalLink::query()
                    ->where('website_id', $website->id)
                    ->where('group_id', $g->id)
                    ->orderBy('group_index') // urutan dalam grup
                    ->orderBy('index')       // fallback
                    ->get(['id', 'label', 'url', 'group_id', 'group_index', 'index'])
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'label' => $m->label,
                        'url' => $m->url,
                        'group_id' => $m->group_id,
                        'group_index' => $m->group_index,
                        'index' => $m->index,
                    ])
                    ->values();

                return [
                    'id' => $g->id,
                    'name' => $g->name,
                    'items' => $items,
                ];
            })
            ->values();

        return Inertia::render('external-links/index', [
            'externals' => [
                'singles' => $singles,
                'groups' => $groups,
            ],
            'website' => $website->only(['id', 'name', 'external_link_display_mode']),
        ]);
    }

    public function destroy(Request $request, Website $website, ExternalLink $externalLink)
    {
        if ($externalLink->website_id !== $website->id) {
            abort(404);
        }
        $externalLink->delete();
        if ($request->header('X-Inertia')) {
            return to_route('externalLinks.index', ['website' => $website->id], 303);
        }

        return response()->noContent();
    }

    public function destroyGroup(Request $request, Website $website, ExternalLinkGroup $group)
    {
        if ($group->website_id !== $website->id) {
            abort(404);
        }

        DB::transaction(function () use ($website, $group) {
            ExternalLink::where('website_id', $website->id)
                ->where('group_id', $group->id)
                ->delete();
            $group->delete();
        });

        if ($request->header('X-Inertia')) {
            return to_route('externalLinks.index', ['website' => $website->id], 303);
        }

        return response()->noContent();
    }

    public function list(Request $request, Website $website)
    {
        $data = ExternalLink::query()
            ->where('website_id', $website->id)
            ->whereNull('group_id')
            ->orderBy('index')
            ->get(['id', 'label', 'url'])
            ->map(fn ($m) => [
                'id' => $m->id,
                'label' => $m->label,
                'url' => $m->url,
            ])
            ->values();

        return response()->json(['data' => $data]);
    }

    public function listGroup(Request $request, Website $website)
    {
        $groups = ExternalLinkGroup::where('website_id', $website->id)
            ->orderBy('index')
            ->get();

        $payload = $groups->map(function ($g) use ($website) {
            $items = ExternalLink::where('website_id', $website->id)
                ->where('group_id', $g->id)
                ->orderBy('group_index')
                ->orderBy('index')
                ->get();

            return [
                'id' => $g->id,
                'name' => $g->name,
                'items' => $items->map(function ($l) {
                    return [
                        'id' => $l->id,
                        'label' => $l->label,
                        'url' => $l->url,
                        'index' => $l->index,
                        'group_index' => $l->group_index,
                        'group_id' => $l->group_id,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json(['data' => $payload]);
    }

    public function store(Request $request, Website $website)
    {
        $mode = $request->input('mode');

        if ($mode === 'single') {
            $data = $request->validate([
                'mode' => ['required', Rule::in(['single'])],
                'items' => ['required', 'array'],
                'items.*.label' => ['nullable', 'string'],
                'items.*.url' => ['nullable', 'string', 'max:2048'], // jangan pakai 'url' rule (placeholder FE)
                'items.*.index' => ['nullable', 'integer'],
            ]);

            DB::transaction(function () use ($website, $data) {
                // Hapus semua link single dulu, lalu recreate sesuai urutan payload
                ExternalLink::where('website_id', $website->id)->whereNull('group_id')->delete();

                $idx = 0;
                foreach ($data['items'] as $it) {
                    // skip baris kosong
                    $label = $it['label'] ?? '';
                    $url = $it['url'] ?? '';
                    if ($label === '' && $url === '') {
                        continue;
                    }

                    ExternalLink::create([
                        'label' => $label,
                        'url' => $url,
                        'index' => $idx,     // urutan tampilan single
                        'group_id' => null,
                        'group_index' => 0,        // WAJIB isi (kolom NOT NULL)
                        'website_id' => $website->id,
                    ]);
                    $idx++;
                }
            });

            if ($request->header('X-Inertia')) {
                return to_route('externalLinks.index', ['website' => $website->id], 303);
            }

            return response()->noContent();
        }

        if ($mode === 'group') {
            $data = $request->validate([
                'mode' => ['required', Rule::in(['group'])],
                'groups' => ['required', 'array'],
                'groups.*.name' => ['nullable', 'string'],
                'groups.*.index' => ['nullable', 'integer'],
                'groups.*.items' => ['nullable', 'array'],
                'groups.*.items.*.label' => ['nullable', 'string'],
                'groups.*.items.*.url' => ['nullable', 'string', 'max:2048'],
                'groups.*.items.*.group_index' => ['nullable', 'integer'],
            ]);

            DB::transaction(function () use ($website, $data) {
                // Sederhana & deterministik untuk autosave:
                // reset semua groups & links dari website ini, kemudian recreate dari payload
                ExternalLink::where('website_id', $website->id)->delete();
                ExternalLinkGroup::where('website_id', $website->id)->delete();

                foreach ($data['groups'] as $gidx => $g) {
                    $group = ExternalLinkGroup::create([
                        'name' => $g['name'] ?? ('Group '.($gidx + 1)),
                        'index' => $gidx,
                        'website_id' => $website->id,
                    ]);

                    $items = $g['items'] ?? [];
                    foreach ($items as $iidx => $it) {
                        $label = $it['label'] ?? '';
                        $url = $it['url'] ?? '';
                        if ($label === '' && $url === '') {
                            continue;
                        }

                        ExternalLink::create([
                            'label' => $label,
                            'url' => $url,
                            'index' => $iidx, // boleh 0..N (fallback)
                            'group_id' => $group->id,
                            'group_index' => array_key_exists('group_index', $it) ? (int) $it['group_index'] : $iidx,
                            'website_id' => $website->id,
                        ]);
                    }
                }
            });

            return response()->noContent(); // 204
        }

        return response()->json(['message' => 'Invalid mode'], 422);
    }

    public function storeGroup(Request $request, Website $website)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($website, $validated) {
            $nextGroupIdx = (int) ExternalLinkGroup::where('website_id', $website->id)->max('index') + 1;

            $group = ExternalLinkGroup::create([
                'name' => $validated['name'] ?? ('Group '.$nextGroupIdx),
                'index' => $nextGroupIdx,
                'website_id' => $website->id,
            ]);

            // Seed 1 item dummy agar langsung kelihatan di FE
            ExternalLink::create([
                'label' => 'Link Label',
                'url' => 'https://',
                'index' => 0,
                'group_id' => $group->id,
                'group_index' => 0,
                'website_id' => $website->id,
            ]);
        });

        if ($request->header('X-Inertia')) {
            return to_route('externalLinks.index', ['website' => $website->id], 303);
        }

        return response()->noContent();
    }

    public function update(Request $request, Website $website, ExternalLink $externalLink)
    {
        if ($externalLink->website_id !== $website->id) {
            abort(404);
        }

        $data = $request->validate([
            'label' => ['nullable', 'string'],
            'url' => ['nullable', 'string', 'max:2048'],
            'index' => ['nullable', 'integer'],
            'group_id' => ['nullable', 'string'], // ULID grup / null untuk pindah ke single
            'group_index' => ['nullable', 'integer'],
        ]);

        DB::transaction(function () use ($website, $externalLink, $data) {
            if (array_key_exists('group_id', $data)) {
                if ($data['group_id']) {
                    $group = ExternalLinkGroup::where('website_id', $website->id)
                        ->where('id', $data['group_id'])
                        ->firstOrFail();
                    $externalLink->group_id = $group->id;
                    $externalLink->group_index = $data['group_index'] ?? 0;
                } else {
                    // pindah ke single
                    $externalLink->group_id = null;
                    $externalLink->group_index = 0; // jaga NOT NULL
                }
            }

            if (array_key_exists('index', $data)) {
                $externalLink->index = (int) $data['index'];
            }
            if (array_key_exists('label', $data)) {
                $externalLink->label = $data['label'];
            }
            if (array_key_exists('url', $data)) {
                $externalLink->url = $data['url'];
            }

            $externalLink->save();
        });

        if ($request->header('X-Inertia')) {
            return to_route('externalLinks.index', ['website' => $website->id], 303);
        }

        return response()->noContent();
    }

    public function updateDisplayMode(Request $request, Website $website)
    {
        $validated = $request->validate([
            'mode' => ['required', Rule::in([0, 1])],
        ]);

        $website->external_link_display_mode = $validated['mode'];
        $website->save();

        if ($request->header('X-Inertia')) {
            return to_route('externalLinks.index', ['website' => $website->id], 303);
        }

        return response()->noContent();
    }

    public function updateGroup(Request $request, Website $website, ExternalLinkGroup $group)
    {
        if ($group->website_id !== $website->id) {
            abort(404);
        }

        $data = $request->validate([
            'name' => ['nullable', 'string'],
            'index' => ['nullable', 'integer'],
            'items' => ['sometimes', 'array'], // optional batch update
            'items.*.id' => ['required', 'string'],
            'items.*.label' => ['nullable', 'string'],
            'items.*.url' => ['nullable', 'string', 'max:2048'],
            'items.*.group_index' => ['nullable', 'integer'],
        ]);

        DB::transaction(function () use ($website, $group, $data) {
            if (array_key_exists('name', $data)) {
                $group->name = $data['name'] ?? $group->name;
            }
            if (array_key_exists('index', $data)) {
                $group->index = (int) $data['index'];
            }
            $group->save();

            if (isset($data['items'])) {
                foreach ($data['items'] as $row) {
                    $link = ExternalLink::where('website_id', $website->id)
                        ->where('group_id', $group->id)
                        ->where('id', $row['id'])
                        ->first();
                    if (! $link) {
                        continue;
                    }

                    if (array_key_exists('label', $row)) {
                        $link->label = $row['label'];
                    }
                    if (array_key_exists('url', $row)) {
                        $link->url = $row['url'];
                    }
                    if (array_key_exists('group_index', $row)) {
                        $link->group_index = (int) $row['group_index'];
                    }
                    $link->save();
                }
            }
        });

        if ($request->header('X-Inertia')) {
            return to_route('externalLinks.index', ['website' => $website->id], 303);
        }

        return response()->noContent();
    }
}
