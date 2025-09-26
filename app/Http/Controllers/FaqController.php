<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\FaqGroup;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('faqs/index');
    }

    public function destroy(Request $request, Faq $faq)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function destroyGroup(Request $request, FaqGroup $faqGroup)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function list(Request $request, Website $website)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function listGroup(Request $request, Website $website)
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

    public function storeGroup(Request $request, Website $website)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function update(Request $request, Faq $faq)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function updateDisplayMode(Request $request, Website $website)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function updateGroup(Request $request, FaqGroup $faqGroup)
    {
        return response()->json([
            'data' => [],
        ]);
    }
}
