<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('forms/index');
    }

    public function indexSubmissions(Request $request, Form $form)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function create(Request $request, string $website)
    {
        return Inertia::render('forms/create');
    }

    public function destroy(Request $request, Form $form)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function destroySubmission(Request $request, FormSubmission $submission)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function edit(Request $request, string $form)
    {
        return Inertia::render('forms/edit');
    }

    public function list(Request $request, Website $website)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function preview(Request $request, Form $form)
    {
        return response()->json([
            'data' => [],
        ]);
    }

    public function showSubmission(Request $request, FormSubmission $submission)
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

    public function update(Request $request, Form $form)
    {
        return response()->json([
            'data' => [],
        ]);
    }
}
