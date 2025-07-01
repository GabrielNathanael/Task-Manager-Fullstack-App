<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Menyediakan data awal yang dibutuhkan untuk dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Ambil data tugas milik user, diurutkan dari yang terbaru
        $tasks = $user->tasks()->orderBy('created_at', 'desc')->get();

        // Kembalikan data user dan tasks dalam satu respons
        return response()->json([
            'user' => $user,
            'tasks' => $tasks,
        ], 200);
    }
}