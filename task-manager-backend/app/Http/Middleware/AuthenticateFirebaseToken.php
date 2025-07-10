<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken; 

class AuthenticateFirebaseToken
{
    protected $firebaseAuth;

    public function __construct()
    {
        $factory = (new Factory)
            ->withServiceAccount(config('firebase.credentials'));

        $this->firebaseAuth = $factory->createAuth();
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthorized: No authentication token provided.'], 401);
        }

        // 1. Coba verifikasi sebagai Token Sanctum 

        if (str_contains($token, '|')) {
            try {
                // Temukan Personal Access Token berdasarkan token yang diberikan
                $accessToken = PersonalAccessToken::findToken($token);

                if ($accessToken && $accessToken->tokenable) {
                    // Jika token ditemukan dan ada pemiliknya, set user sebagai authenticated
                    Auth::login($accessToken->tokenable);
                    return $next($request); // Lanjutkan permintaan
                }
            } catch (\Exception $e) {
                // Log error jika ada masalah dengan token Sanctum, tapi tetap coba Firebase
                Log::warning('Sanctum Token Authentication failed: ' . $e->getMessage());
            }
        }

        // 2. Jika bukan token Sanctum atau verifikasi Sanctum gagal, coba verifikasi sebagai Firebase ID Token (jalur lambat)
        try {
            $verifiedIdToken = $this->firebaseAuth->verifyIdToken($token); // Gunakan $token di sini

            $uid = $verifiedIdToken->claims()->get('sub');
            $email = $verifiedIdToken->claims()->get('email');
            $name = $verifiedIdToken->claims()->get('name') ?? explode('@', $email)[0];

            $user = User::where('firebase_uid', $uid)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'firebase_uid' => $uid,
                    'password' => null, 
                ]);
            }

            Auth::login($user); // Autentikasi user di sesi Laravel
            return $next($request); // Lanjutkan permintaan
        } catch (\Exception $e) {
            Log::error('Firebase ID Token Authentication failed: ' . $e->getMessage());
            return response()->json(['message' => 'Unauthorized: Invalid authentication token.', 'error' => $e->getMessage()], 401);
        }
    }
}