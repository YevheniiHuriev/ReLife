<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends BaseController
{
    protected AuthService $auth;

    public function __construct(AuthService $auth)
    {
        $this->auth = $auth;
    }

    public function register(Request $request)
    {
        try {
            $user = $this->auth->register($request);
            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Не вдалося створити користувача'], 500);
        }
    }

    public function login(Request $request)
    {
        $result = $this->auth->login($request);

        if ($result) {
            return response()->json($result, 200);
        }

        return response()->json([
            "success" => false,
            "message" => "Invalid email or password",
        ], 401);
    }

    public function profile()
    {
        $userData = auth()->user()->load('role');
        return $this->send_response($userData, "Profile information");
    }

    public function logout()
    {
        $token = auth()->user()->token();
        $token->revoke();
        return $this->send_response([], "User Logged out successfully");
    }

    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|string|email']);
        $exists = $this->auth->checkEmail($request->email);
        return response()->json(['exists' => $exists]);
    }

    public function checkPassword(Request $request)
    {
        $request->validate([
            'id' => 'required|int',
            'password' => 'required|string',
        ]);

        $valid = $this->auth->checkPassword($request->id, $request->password);
        return response()->json(['check' => $valid]);
    }
}
