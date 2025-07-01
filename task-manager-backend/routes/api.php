<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController; 
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\DashboardController; // <-- 1. TAMBAHKAN BARIS INI
use App\Http\Middleware\AuthenticateFirebaseToken; 

// Rute ini tidak memerlukan autentikasi
Route::post('/auth/firebase-login', [AuthController::class, 'firebaseLogin']); 

// Semua rute di dalam grup ini akan dilindungi oleh middleware
Route::middleware(AuthenticateFirebaseToken::class)->group(function () { 

    // 2. PINDAHKAN RUTE DASHBOARD KE SINI
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Task Routes
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::put('/tasks/{task}', [TaskController::class, 'update']); 
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    // Project Routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    Route::get('/projects/{project}/tasks', [ProjectController::class, 'tasks']);
    // User Route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});