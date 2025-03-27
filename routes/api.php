<?php
use Illuminate\Support\Facades\Route;
use Sawmainek\Apitoolz\Http\Controllers\AuthController;
use Sawmainek\Apitoolz\Http\Controllers\TwoFactorAuthController;
use Sawmainek\Apitoolz\Http\Controllers\ModelController;

Route::prefix('api')->group(function () {
    // Auth
    Route::controller(AuthController::class)
    ->group(function () {
        Route::post('/login', 'login')->middleware([]);
        Route::post('/register', 'register')->middleware([]);
        Route::get('/user', 'show')->middleware(['auth:sanctum']);
        Route::post('/edit-profile', 'editProfle')->middleware(['auth:sanctum']);
        Route::post('/change-password', 'changePassword')->middleware(['auth:sanctum']);
        Route::post('/logout', 'logout')->middleware(['auth:sanctum']);
        Route::post('/forgot-password', 'forgotPassword');
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
        Route::delete('/model/{slug}/{table}', 'destroy')->middleware(['auth:sanctum']);
    });
});
