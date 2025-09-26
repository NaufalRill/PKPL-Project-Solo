<?php

namespace App\Http\Middleware;

use App\Models\Website;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CheckContentAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user->hasRole('client')) {
            $websiteId = $request->route('website')->id;
            if (! $user->client->hasWebsite($websiteId)) {
                throw new NotFoundHttpException;
            }
        }

        // dd($request->user()->hasRole('client'));
        // dd($request->route('website')->id);
        return $next($request);
    }
}
