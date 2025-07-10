<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken; 
use Illuminate\Support\Facades\Validator; 

class AuthController extends Controller
{
    protected $firebaseAuth;

    public function __construct()
    {
        $factory = (new Factory)
            ->withServiceAccount(config('firebase.credentials'));

        $this->firebaseAuth = $factory->createAuth();
    }

    public function firebaseLogin(Request $request)
    {
        $idToken = $request->input('idToken');
        $usernameFromRequest = $request->input('username'); 

        if (!$idToken) {
            return response()->json(['message' => 'Unauthorized: No Firebase ID Token provided.'], 400);
        }

        try {
            $verifiedIdToken = $this->firebaseAuth->verifyIdToken($idToken);

            $uid = $verifiedIdToken->claims()->get('sub');
            $email = $verifiedIdToken->claims()->get('email');
            
            // Nama dari Firebase Token (displayName) atau dari username yang dikirim
            $nameFromFirebase = $verifiedIdToken->claims()->get('name') ?? $verifiedIdToken->claims()->get('displayName') ?? explode('@', $email)[0];
            $finalName = $usernameFromRequest ?? $nameFromFirebase; // Prioritaskan username dari request jika ada

            // Cari user berdasarkan firebase_uid
            $user = User::where('firebase_uid', $uid)->first();

            // Jika user TIDAK DITEMUKAN, ini adalah registrasi pertama kali atau login pertama setelah migrate:fresh
            if (!$user) {
               
            
                $validator = Validator::make($request->all(), [
                    'username' => 'required|string|min:3|max:25|unique:users', 
                ]);

                if ($validator->fails()) {
                    return response()->json(['errors' => $validator->errors()], 422); // Kirim error validasi
                }

                // Buat user baru dengan data dari Firebase DAN username dari request
                $user = User::create([
                    'name' => $finalName, 
                    'username' => $usernameFromRequest, 
                    'email' => $email,
                    'firebase_uid' => $uid,
                    'password' => null, 
                ]);
            } else {
                // Jika user sudah ada, perbarui username-nya jika berbeda
                if ($user->username !== $usernameFromRequest && $usernameFromRequest) {
                    $user->update(['username' => $usernameFromRequest]);
                }
            }

            // Lanjutkan proses login untuk user yang sudah ada atau yang baru dibuat
            Auth::login($user); 

            $user->tokens()->delete(); 
            $sanctumToken = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful.',
                'user' => $user->only(['id', 'name', 'username', 'email', 'firebase_uid']), // Kirim data user yang relevan
                'token' => $sanctumToken,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Firebase Token Verification Error: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid Firebase ID Token or authentication failed.', 'error' => $e->getMessage()], 401);
        }
    }
}
