<?php
use Illuminate\Support\Facades\Route;
use Sawmainek\Apitoolz\Http\Controllers\AppSettingController;
use Sawmainek\Apitoolz\Http\Controllers\AuthController;
use Sawmainek\Apitoolz\Http\Controllers\RoleController;
use Sawmainek\Apitoolz\Http\Controllers\TwoFactorAuthController;
use Sawmainek\Apitoolz\Http\Controllers\ModelController;
use Sawmainek\Apitoolz\Http\Controllers\UsersController;

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
    // Model Controller
    Route::controller(ModelController::class)
    ->group(function () {
        Route::get('/model', 'index')->middleware(['auth:sanctum']);
        Route::get('/model/tables', 'tables')->middleware(['auth:sanctum']);
        Route::post('/model', 'store')->middleware(['auth:sanctum']);
        Route::get('/model/{slug}', 'show')->middleware(['auth:sanctum']);
        Route::put('/model/{id}', 'update')->middleware(['auth:sanctum']);
        Route::get('/model/{slug}/ask-request', 'askRequest')->middleware(['auth:sanctum']);
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
        Route::get('/{appSetting}', 'show')->middleware(['role:super', 'role:admin']);
        Route::put('/{appSetting}', 'update')->middleware(['role:super']);
        Route::delete('/{appSetting}', 'destroy')->middleware(['role:super']);
        Route::put('/{appSetting}/restore', 'restore')->middleware(['role:super']);
        Route::delete('/{appSetting}/force-destory', 'forceDestroy')->middleware(['role:super']);
    });
});
