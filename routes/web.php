<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ExternalLinkController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\WebsiteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

const PREFIX_ARTICLES = 'articles';
const PREFIX_CLIENTS = 'clients';
const PREFIX_EXTERNAL_LINKS = 'external-links';
const PREFIX_EXTERNAL_LINK_GROUPS = 'external-link-groups';
const PREFIX_FAQS = 'faqs';
const PREFIX_FAQ_GROUPS = 'faq-groups';
const PREFIX_FORMS = 'forms';
const PREFIX_SUBMISSIONS = 'submissions';
const PREFIX_WEBSITES = 'websites';

Route::get('/', function (Request $request) {
    $user = $request->user();

    if ($user === null) {
        return redirect()->route('login');
    }

    if ($user->hasRole('client')) {
        return redirect()->route('articles.index');
    }

    return Inertia::render('home');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->middleware(['role:admin']);

    Route::prefix(PREFIX_WEBSITES)->group(function () {
        Route::middleware(['role:admin|client'])->group(function () {
            Route::get('/list', [WebsiteController::class, 'list'])->name('websites.list');

            Route::prefix('{website}/'.PREFIX_ARTICLES)->group(function () {
                Route::get('/list', [ArticleController::class, 'list'])->name('articles.list')->middleware(['check_content_access']);
                Route::get('/create', [ArticleController::class, 'create'])->name('articles.create');
                Route::post('/', [ArticleController::class, 'store'])->name('articles.store');
                Route::get('/{article}/edit', [ArticleController::class, 'edit'])->name('articles.edit');
            });

            Route::prefix('{website}/'.PREFIX_EXTERNAL_LINKS)->group(function () {
                Route::get('/list', [ExternalLinkController::class, 'list'])->name('externalLinks.list');
                Route::post('/', [ExternalLinkController::class, 'store'])->name('externalLinks.store');
                Route::put('/display-mode', [ExternalLinkController::class, 'updateDisplayMode'])->name('externalLinks.updateDisplayMode');
            });

            Route::prefix('{website}/'.PREFIX_EXTERNAL_LINK_GROUPS)->group(function () {
                Route::get('/list', [ExternalLinkController::class, 'listGroup'])->name('externalLinkGroups.list');
                Route::post('/', [ExternalLinkController::class, 'storeGroup'])->name('externalLinkGroups.store');
            });

            Route::prefix('{website}/'.PREFIX_FAQS)->group(function () {
                Route::get('/list', [FaqController::class, 'list'])->name('faqs.list');
                Route::post('/', [FaqController::class, 'store'])->name('faqs.store');
                Route::put('/display-mode', [FaqController::class, 'updateDisplayMode'])->name('faqs.updateDisplayMode');
            });

            Route::prefix('{website}/'.PREFIX_FAQ_GROUPS)->group(function () {
                Route::get('/list', [FaqController::class, 'listGroup'])->name('faqGroups.list');
                Route::post('/', [FaqController::class, 'storeGroup'])->name('faqGroups.store');
            });

            Route::prefix('{website}/'.PREFIX_FORMS)->group(function () {
                Route::get('/list', [FormController::class, 'list'])->name('forms.list');
                Route::get('/create', [FormController::class, 'create'])->name('forms.create');
                Route::post('/', [FormController::class, 'store'])->name('forms.store');
                Route::get('/{form}/edit', [FormController::class, 'edit'])->name('forms.edit');
                Route::get('/{form}/preview', [FormController::class, 'preview'])->name('form.preview');

                Route::prefix('{form}/'.PREFIX_SUBMISSIONS)->group(function () {
                    Route::get('/', [FormController::class, 'indexSubmissions'])->name('formSubmissions.index');
                    Route::get('/{submission}', [FormController::class, 'showSubmission'])->name('formSubmissions.show');
                });
            });
        });

        Route::middleware(['role:admin'])->group(function () {
            Route::get('/', [WebsiteController::class, 'index'])->name('websites.index');
            Route::get('/create', [WebsiteController::class, 'create'])->name('websites.create');
            Route::post('/', [WebsiteController::class, 'store'])->name('websites.store');
            Route::get('/{website}', [WebsiteController::class, 'detail'])->name('websites.detail');
            Route::get('/{website}/edit', [WebsiteController::class, 'edit'])->name('websites.edit');
            Route::put('/{website}', [WebsiteController::class, 'update'])->name('websites.update');
            Route::delete('/{website}', [WebsiteController::class, 'destroy'])->name('websites.destroy');
        });
    });

    Route::prefix(PREFIX_ARTICLES)->middleware(['role:admin|client'])->group(function () {
        Route::get('/', [ArticleController::class, 'index'])->name('articles.index');
        Route::put('/{article}', [ArticleController::class, 'update'])->name('articles.update');
        Route::delete('/{article}', [ArticleController::class, 'destroy'])->name('articles.destroy');
    });

    Route::prefix(PREFIX_CLIENTS)->middleware(['role:admin'])->group(function () {
        Route::get('/', [ClientController::class, 'index'])->name('clients.index');
        Route::get('/list', [ClientController::class, 'list'])->name('clients.list');
        Route::get('/create', [ClientController::class, 'create'])->name('clients.create');
        Route::post('/', [ClientController::class, 'store'])->name('clients.store');
        Route::get('/{client}/edit', [ClientController::class, 'edit'])->name('clients.edit');
        Route::put('/{client}', [ClientController::class, 'update'])->name('clients.update');
        Route::delete('/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');
    });

    Route::prefix(PREFIX_EXTERNAL_LINKS)->middleware(['role:admin|client'])->group(function () {
        Route::get('/', [ExternalLinkController::class, 'index'])->name('externalLinks.index');
        Route::put('/{externalLink}', [ExternalLinkController::class, 'update'])->name('externalLinks.update');
        Route::delete('/{externalLink}', [ExternalLinkController::class, 'destroy'])->name('externalLinks.destroy');
    });

    Route::prefix(PREFIX_EXTERNAL_LINK_GROUPS)->middleware(['role:admin|client'])->group(function () {
        Route::put('/{externalLinkGroup}', [ExternalLinkController::class, 'updateGroup'])->name('externalLinkGroup.update');
        Route::delete('/{externalLinkGroup}', [ExternalLinkController::class, 'destroyGroup'])->name('externalLinkGroup.destroy');
    });

    Route::prefix(PREFIX_FAQS)->middleware(['role:admin|client'])->group(function () {
        Route::get('/', [FaqController::class, 'index'])->name('faqs.index');
        Route::put('/{faq}', [FaqController::class, 'update'])->name('faqs.update');
        Route::delete('/{faq}', [FaqController::class, 'destroy'])->name('faqs.destroy');
    });

    Route::prefix(PREFIX_FAQ_GROUPS)->middleware(['role:admin|client'])->group(function () {
        Route::put('/{faqGroup}', [FaqController::class, 'updateGroup'])->name('faqGroups.update');
        Route::delete('/{faqGroup}', [FaqController::class, 'destroyGroup'])->name('faqGroups.destroy');
    });

    Route::prefix(PREFIX_FORMS)->middleware(['role:admin|client'])->group(function () {
        Route::get('/', [FormController::class, 'index'])->name('forms.index');
        Route::put('/{form}', [FormController::class, 'update'])->name('forms.update');
        Route::delete('/{form}', [FormController::class, 'destroy'])->name('forms.destroy');

        Route::prefix('{form}/'.PREFIX_SUBMISSIONS)->group(function () {
            Route::get('/list', [FormController::class, 'listSubmissions'])->name('formSubmissions.list');
        });
    });

    Route::prefix(PREFIX_SUBMISSIONS)->middleware(['role:admin|client'])->group(function () {
        Route::delete('/{submission}', [FormController::class, 'destroySubmission'])->name('formSubmissions.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
