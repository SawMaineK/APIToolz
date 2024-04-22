<?php

use Illuminate\Support\Facades\Route;
use Sawmainek\Apitoolz\Http\Controllers\FileStorageController;

Route::get('/img/{path}', [FileStorageController::class, 'image'])->where('path', '.*');
Route::get('/file/{path}', [FileStorageController::class, 'file'])->where('path', '.*');
