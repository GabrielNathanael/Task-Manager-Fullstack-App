<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // Sesuaikan use statement ini

Route::post('/auth/firebase-login', [AuthController::class, 'firebaseLogin']);

// Contoh rute API terproteksi (akan kita gunakan nanti)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});