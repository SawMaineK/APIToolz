<?php

use Illuminate\Support\Facades\Route;
use Sawmainek\Apitoolz\Http\Controllers\FileStorageController;

Route::get('/img/{path}', [FileStorageController::class, 'image'])->where('path', '.*');
Route::get('/file/{path}', [FileStorageController::class, 'file'])->where('path', '.*');

Route::prefix('apitoolz')->group(function () {
    Route::view('/{path?}', 'apitoolz::app');
    Route::view('/{path?}/{app?}', 'apitoolz::app');
    Route::view('/{path?}/{app?}/{module?}', 'apitoolz::app');
    Route::view('/{path?}/{app?}/{module?}/{page?}', 'apitoolz::app');
    Route::view('/{path?}/{app?}/{module?}/{page?}/{action?}', 'apitoolz::app');
});
