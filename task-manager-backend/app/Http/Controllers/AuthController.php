<?php

namespace App\Http\Controllers; 

use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

        if (!$idToken) {
            return response()->json(['message' => 'Firebase ID Token not provided.'], 400);
        }

        try {
            $verifiedIdToken = $this->firebaseAuth->verifyIdToken($idToken);

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

            Auth::login($user);

            return response()->json([
                'message' => 'Login successful via Firebase.',
                'user' => $user,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Firebase Token Verification Error: ' . $e->getMessage());
            return response()->json(['message' => 'Invalid Firebase ID Token or authentication failed.', 'error' => $e->getMessage()], 401);
        }
    }
}