<?php

use Illuminate\Support\Facades\Route;
use Sawmainek\Apitoolz\Http\Controllers\FileStorageController;

Route::get('/apitoolz', function() {
    return view("apitoolz::app");
});
Route::get('/apitoolz/auth/login', function() {
    return view("apitoolz::app");
});
Route::get('/img/{path}', [FileStorageController::class, 'image'])->where('path', '.*');
Route::get('/file/{path}', [FileStorageController::class, 'file'])->where('path', '.*');
