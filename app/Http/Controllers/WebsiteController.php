<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Website;
use App\Models\WebsiteFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WebsiteController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('websites/index');
    }

    public function create()
    {
        $locale = app()->getLocale() ?? 'en';

        $clients = Client::query()
            ->leftJoin('users', 'users.id', '=', 'clients.user_id')
            ->orderBy('users.name')
            ->limit(50)
            ->get([
                'clients.id as id',
                DB::raw('users.name as name'),
            ]);

        $features = WebsiteFeature::query()
            ->select([
                'id',
                DB::raw("COALESCE(name->>'$locale', name->>'en') as name_text"),
            ])
            ->orderBy('id')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name_text,   // <-- plain string, tidak kena cast 'name'
            ]);

        return inertia('websites/create', [
            'clients' => $clients,
            'features' => $features,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'faq_display_mode' => ['nullable', 'integer', 'min:0'],
            'external_link_display_mode' => ['nullable', 'integer', 'min:0'],
            'deployed_at' => ['nullable', 'date'],
            'order_number' => ['nullable', 'string', 'max:255'],
            'clients' => ['nullable', 'array'],
            'clients.*' => ['string', 'size:26', 'exists:clients,id'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'exists:website_features,id'],
        ]);

        $website = DB::transaction(function () use ($data) {
            $website = Website::create([
                'name' => $data['name'],
                'url' => $data['url'] ?? null,
                'faq_display_mode' => $data['faq_display_mode'] ?? 0,
                'external_link_display_mode' => $data['external_link_display_mode'] ?? 0,
                'deployed_at' => $data['deployed_at'] ?? null,
                'order_number' => $data['order_number'] ?? (string) Str::uuid(),
            ]);

            if (! empty($data['clients'])) {
                $website->clients()->sync($data['clients']);
            }
            if (! empty($data['features'])) {
                $website->features()->sync($data['features']);
            }

            return $website->fresh()->load(['features:id,name']);
        });

        return redirect()
            ->route('websites.index')
            ->with('success', __('app.created'));
    }

    public function destroy(Request $request, Website $website)
    {
        DB::transaction(function () use ($website) {
            $website->delete();

        });

        return back();
    }

    public function detail(Request $request, Website $website)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function edit(Request $request, Website $website)
    {
        $locale = app()->getLocale() ?? 'en';

        // Preload relasi untuk preselected IDs
        $website->load([
            'clients.user:id,name',
            'features:id', // cukup id saja, label ambil dari $features options di bawah
        ]);

        $selectedClientIds = $website->clients->pluck('id')->all();
        $selectedFeatureIds = $website->features->pluck('id')->all();

        // === Opsi Clients (sama seperti create) ===
        $clients = Client::query()
            ->leftJoin('users', 'users.id', '=', 'clients.user_id')
            ->orderBy('users.name')
            ->limit(50)
            ->get([
                'clients.id as id',
                DB::raw('users.name as name'),
            ]);

        // === Opsi Features (sama seperti create) ===
        // alias -> name_text lalu di-map ke name (string plain)
        $features = WebsiteFeature::query()
            ->select([
                'id',
                DB::raw("COALESCE(name->>'$locale', name->>'en') as name_text"),
            ])
            ->orderBy('id')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name_text, // <- string biasa
            ]);

        // Website payload untuk halaman edit
        // Preselected clients dikirim dengan id+name, features boleh ambil dari list $features yang sudah diolah
        $websitePayload = [
            'id' => $website->id,
            'name' => $website->name,
            'url' => $website->url,
            'deployed_at' => optional($website->deployed_at)->format('Y-m-d'),
            'faq_display_mode' => $website->faq_display_mode,
            'external_link_display_mode' => $website->external_link_display_mode,

            // Preselected chips: clients id+name
            'clients' => $website->clients->map(fn ($c) => [
                'id' => $c->id,
                'name' => optional($c->user)->name,
            ])->values(),

            // Preselected features: ambil dari opsi $features agar field 'name' sudah string
            'features' => $features->whereIn('id', $selectedFeatureIds)->values(),
        ];

        // NOTE: sesuaikan path komponen inertia sesuai struktur projekmu
        return Inertia::render('websites/edit', [
            'website' => $websitePayload,
            'clients' => $clients,
            'features' => $features,
        ]);
    }

    public function list(Request $request)
    {
        $locale = app()->getLocale() ?? 'en';
        $perPage = (int) ($request->integer('per_page') ?: 10);
        $orderBy = $request->get('order_by') ?: 'name';
        $orderDir = strtolower($request->get('order_dir') ?: 'asc') === 'desc' ? 'desc' : 'asc';
        $keyword = trim((string) $request->get('keyword', ''));

        $query = Website::query();

        if ($keyword !== '') {
            $query->smartSearch($keyword);
        }

        $query->with([

            'features' => function ($q) use ($locale) {
                $q->select([
                    'website_features.id',
                    DB::raw("COALESCE(website_features.name->>'$locale', website_features.name->>'en') as name"),
                ]);
            },

            'clients' => function ($q) {
                $q->select('clients.id', 'clients.user_id')->with('user:id,name');
            },
        ]);

        if (in_array($orderBy, ['name', 'url', 'deployed_at'], true)) {
            $query->orderBy($orderBy, $orderDir);
        } else {
            $query->orderBy('name', 'asc');
        }

        $paginator = $query->paginate($perPage)->appends($request->query());

        $items = $paginator->getCollection()->map(function (Website $w) {
            return [
                'id' => $w->id,
                'name' => $w->name,
                'url' => $w->url,
                'clients' => $w->clients->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->user?->name ?? '—',
                ])->values(),
                'status' => $w->status(),
                'deployedAt' => optional($w->deployed_at)->toIso8601String(),

            ];
        })->values();

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function update(Request $request, Website $website)
    {
        // Validasi sesuai field yang dikirim edit.tsx
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:255'], // sengaja pakai string (tidak 'url') agar fleksibel
            'deployed_at' => ['nullable', 'date'],
            'faq_display_mode' => ['nullable', 'integer'],
            'external_link_display_mode' => ['nullable', 'integer'],
            'clients' => ['nullable', 'array'],
            'clients.*' => ['exists:clients,id'],
            'features' => ['nullable', 'array'],
            'features.*' => ['exists:website_features,id'],
        ]);

        // Update kolom utama
        $website->fill([
            'name' => $validated['name'],
            'url' => $validated['url'],
            'deployed_at' => $validated['deployed_at'] ?? null,
            'faq_display_mode' => $validated['faq_display_mode'] ?? 0,
            'external_link_display_mode' => $validated['external_link_display_mode'] ?? 0,
        ])->save();

        // Sync relasi — kalau array dikirim kosong, akan mengosongkan pivot
        if ($request->has('clients')) {
            $website->clients()->sync($validated['clients'] ?? []);
        }

        if ($request->has('features')) {
            $website->features()->sync($validated['features'] ?? []);
        }

        // Redirect bebas: ke index atau kembali ke edit
        return redirect()
            ->route('websites.index')
            ->with('success', 'Website updated successfully.');
    }
}
