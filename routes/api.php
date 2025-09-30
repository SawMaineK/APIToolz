<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Sawmainek\Apitoolz\Http\Controllers\AppSettingController;
use Sawmainek\Apitoolz\Http\Controllers\AuthController;
use Sawmainek\Apitoolz\Http\Controllers\IntegrationController;
use Sawmainek\Apitoolz\Http\Controllers\OIDCLoginController;
use Sawmainek\Apitoolz\Http\Controllers\RoleController;
use Sawmainek\Apitoolz\Http\Controllers\TwoFactorAuthController;
use Sawmainek\Apitoolz\Http\Controllers\ModelController;
use Sawmainek\Apitoolz\Http\Controllers\UsersController;
use Sawmainek\Apitoolz\Http\Controllers\WorkflowController;
use Sawmainek\Apitoolz\Services\IntegrationService;

Route::prefix('oidc')->group(function () {
    Route::get('/login', [OIDCLoginController::class, 'login'])->name('oidc.login');
    Route::get('/callback', [OIDCLoginController::class, 'login'])->name('oidc.callback');
    Route::post('/logout', [OIDCLoginController::class, 'logout'])->name('oidc.logout');
});

Route::match(['get', 'post'], '/integration/trigger/{workflow}/{stepId}', function (Request $request, string $workflow, string $stepId) {
    $integration = new IntegrationService();

    // Use query parameters for GET, body for POST
    $context = $request->isMethod('get') ? $request->query() : $request->all();

    \Log::debug("Request context: ", $context);

    $response = $integration->runWorkflow($workflow, $stepId, $context);

    if ($response instanceof RedirectResponse) {
        return $response;
    }

    return response()->json($response);
});

Route::prefix('api')->group(function () {
    // Auth
    Route::controller(AuthController::class)
    ->group(function () {
        Route::post('/login', 'login')->middleware([]);
        Route::post('/register', 'register')->middleware([]);
        Route::get('/user', 'show')->middleware(['auth:sanctum']);
        Route::post('/edit-profile', 'editProfile')->middleware(['auth:sanctum']);
        Route::post('/change-password', 'changePassword')->middleware(['auth:sanctum']);
        Route::post('/logout', 'logout')->middleware(['auth:sanctum']);
        Route::delete('/delete', 'delete')->middleware(['auth:sanctum']);
        Route::post('/forgot-password', 'forgotPassword');
        Route::post('/verify-otp', 'verifyOTP');
        Route::post('/reset-password', 'resetPassword');
    });
    // Two Factor Auth
    Route::controller(TwoFactorAuthController::class)
    ->group(function () {
        Route::post('/resend-2fa', 'resend2FA');
        Route::post('/verify-2fa', 'verify2FA');
        Route::post('/enable-2fa', 'enable2FA')->middleware(['auth:sanctum']);
        Route::post('/disable-2fa', 'disable2FA')->middleware(['auth:sanctum']);
    });
    // Workflow Controller
    Route::controller(WorkflowController::class)
    ->prefix('workflows')->middleware(['auth:sanctum'])
    ->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'delete');
        Route::get('/{name}/definition', 'definition');
        Route::post('/{name}/start', 'start');
        Route::post('/{name}/{instanceId}/step/{stepId}', 'submitStep');
        Route::get('/{name}/instance/{instanceId}', 'instance');
        Route::get('/{name}/instances', 'instances');
        Route::get('/instance/{instanceId}', 'history');
        Route::put('/steps/{id}/comment', 'updateComment');
        Route::delete('/{id}', 'deleteWorkflow');
        Route::delete('/instance/{id}', 'deleteInstance');
        Route::delete('/steps/{id}/comment', 'destroyComment');
    });
    // Integration Controller
    Route::controller(IntegrationController::class)
    ->prefix('integrations')->middleware(['auth:sanctum'])
    ->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::get('{slug}', 'show');
        Route::put('{slug}', 'update');
        Route::delete('{slug}', 'destroy');

        Route::post('{slug}/run', 'run');
    });
    // Model Controller
    Route::controller(ModelController::class)
    ->group(function () {
        Route::get('/model', 'index')->middleware(['auth:sanctum']);
        Route::get('/model/tables', 'tables')->middleware(['auth:sanctum']);
        Route::post('/model', 'store')->middleware(['auth:sanctum']);
        Route::get('/model/{slug}', 'show')->middleware(['auth:sanctum']);
        Route::put('/model/{id}', 'update')->middleware(['auth:sanctum']);
        Route::post('/model/{slug}/ask', 'askRequest')->middleware(['auth:sanctum']);
        Route::delete('/model/{slug}/{table}/', 'destroy')->middleware(['auth:sanctum']);
    });

    // User Route Group
    Route::controller(UsersController::class)
        ->prefix('users')->middleware(['auth:sanctum','role:admin'])
        ->group(function () {
            Route::get('/', 'index')->middleware(['permission:view']);
            Route::post('/', 'store')->middleware(['permission:create']);
            Route::get('/{user}', 'show')->middleware(['permission:view']);
            Route::put('/{user}', 'update')->middleware(['permission:edit']);
            Route::delete('/{user}', 'destroy')->middleware(['permission:delete']);
            Route::put('/{user}/restore', 'restore')->middleware(['permission:delete']);
            Route::delete('/{user}/force-destory', 'forceDestroy')->middleware(['permission:delete']);
        });

    // Role Route Group
    Route::controller(RoleController::class)
        ->prefix('role')->middleware(['auth:sanctum','role:admin'])
        ->group(function () {
            Route::get('/', 'index')->middleware([]);
            Route::post('/', 'store')->middleware([]);
            Route::get('/permissions', 'listPermissions')->middleware([]);
            Route::post('/{role}/permissions', 'assignPermissions')->middleware([]);
            Route::get('/{role}', 'show')->middleware([]);
            Route::put('/{role}', 'update')->middleware([]);
            Route::delete('/{role}', 'destroy')->middleware([]);
            Route::put('/{role}/restore', 'restore')->middleware([]);
            Route::delete('/{role}/force-destory', 'forceDestroy')->middleware([]);
        });

    // AppSetting Route Group
    Route::controller(AppSettingController::class)
    ->prefix('appsetting')->middleware(['auth:sanctum'])
    ->group(function () {
        Route::get('/', 'index')->middleware([]);
        Route::post('/', 'store')->middleware(['role:super']);
        Route::get('/summary', 'summary')->middleware(['role:super', 'role:admin']);
        Route::get('/{appSetting}', 'show')->middleware(['role:super', 'role:admin']);
        Route::put('/{appSetting}', 'update')->middleware(['role:super']);
        Route::delete('/{appSetting}', 'destroy')->middleware(['role:super']);
        Route::put('/{appSetting}/restore', 'restore')->middleware(['role:super']);
        Route::delete('/{appSetting}/force-destory', 'forceDestroy')->middleware(['role:super']);
    });
});
