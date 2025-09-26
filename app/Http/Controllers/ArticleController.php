<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Website;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ArticleController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        return Inertia::render('articles/index');
    }

    public function create(Request $request, string $website): InertiaResponse|RedirectResponse
    {
        return Inertia::render('articles/create');
    }

    public function destroy(Request $request, Article $article)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function edit(Request $request, string $article): InertiaResponse|RedirectResponse
    {
        return Inertia::render('articles/edit');
    }

    public function list(Request $request, Website $website)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function store(Request $request, Website $website)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function update(Request $request, Article $article)
    {
        return response()->json([
            'data' => [],
        ]);
    }
}
