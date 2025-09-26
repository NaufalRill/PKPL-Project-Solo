<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('clients/index');
    }

    public function create(Request $request)
    {
        return Inertia::render('clients/create');
    }

    public function edit(Request $request, Client $client)
    {
        $client->load('user'); // Load relasi user

        return Inertia::render('clients/edit', [
            'client' => $client,
            'user' => $client->user,
        ]);
    }

    public function destroy(Client $client)
    {
        DB::transaction(function () use ($client) {
            $userId = $client->user_id;

            $client->delete();

            if ($userId) {
                User::whereKey($userId)->delete();
            }
        });

        return back();
    }

    public function show(Request $request, Client $client): JsonResponse
    {
        try {
            $client->load(['user', 'websites']);

            return response()->json([
                'data' => new ClientResource($client),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'data' => [],
                'error' => 'Failed to retrieve client',
            ], 500);
        }
    }

    public function list(Request $request)
    {
        $keyword = $request->query('keyword');
        $page = $request->query('page');
        $orderBy = $request->query('order_by');
        $orderDir = $request->query('order_dir');

        $query = Client::query();

        $query->with('user:id,name,email');

        if ($keyword != null) {
            $query->smartSearch($keyword);
        }

        if ($orderBy != null) {
            switch ($orderBy) {
                case 'name':
                    $query->join('users', 'clients.user_id', '=', 'users.id')
                        ->orderBy('users.name', $orderDir == 'desc' ? 'desc' : 'asc')
                        ->select('clients.*');
                    break;
            }
        }

        if ($page != null) {
            return $query->paginate(10)->toResourceCollection();
        }

        return $query->get()->toResourceCollection();
    }

    public function store(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|max:32|min:8',
            'contact' => 'required|string|max:255',
        ]);

        DB::beginTransaction();
        try {

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $client = Client::create([
                'user_id' => $user->id,
                'contact' => $validated['contact'],
            ]);

            $user->assignRole(Role::CLIENT);

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to create client. Please try again.']);
        }

        return redirect()
            ->route('clients.index')
            ->with('success', __('app.created'));
    }

    public function update(Request $request, Client $client): RedirectResponse
    {

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$client->user->id,
            'contact' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|max:32|min:8',
        ]);

        DB::beginTransaction();
        try {
            $client->update($validated);

            $userUpdate = ['name' => $validated['name'] ?? $client->user->name,
                'email' => $validated['email'] ?? $client->user->email];
            if (! empty($validated['password'])) {
                $userUpdate['password'] = Hash::make($validated['password']);
            }

            $client->user->update($userUpdate);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->with('error', 'Failed to update client. Please try again.');
        }

        return redirect()
            ->route('clients.index')
            ->with('success', 'Client updated successfully');
    }
}
