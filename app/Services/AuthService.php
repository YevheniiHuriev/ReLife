<?php

namespace App\Services;

use App\Repositories\Contracts\AuthRepository;
use App\Repositories\Contracts\RoleRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Models\User;

class AuthService
{
    protected AuthRepository $users;
    protected RoleRepository $roles;

    public function __construct(AuthRepository $users, RoleRepository $roles)
    {
        $this->users = $users;
        $this->roles = $roles;
    }

    public function register(Request $request): User
    {
        $data = $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|confirmed',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'birthdate' => 'required|date',
            'phone' => 'required|string',
            'address' => 'required|string',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        if (isset($data['photo'])) {
            $photoHash = md5_file($request->file('photo')->getRealPath());
            $photoPath = "storage/photos/{$photoHash}.jpg";

            if (!$this->users->findByEmail($data['email']) && !Storage::exists("public/photos/{$photoHash}.jpg")) {
                $request->file('photo')->storeAs('public/photos', "{$photoHash}.jpg");
            }

            $data['photo'] = $photoPath;
        } else {
            $data['photo'] = 'storage/img/reader.jpg';
        }

        $data['role_id'] = $request->role_id ?? $this->roles->getReaderRoleId();
        $data['password'] = Hash::make($data['password']);

        return $this->users->create($data);
    }

    public function login(Request $request): ?array
    {
        $request->validate([
            "email" => "required|email|string",
            "password" => "required"
        ]);

        $user = $this->users->findByEmail($request->email);

        if ($user && Hash::check($request->password, $user->password)) {
            $token = $user->createToken("u_token")->accessToken;

            return [
                "success" => true,
                "message" => "Login successful",
                "token" => $token,
            ];
        }

        return null;
    }

    public function checkEmail(string $email): bool
    {
        return $this->users->existsByEmail($email);
    }

    public function checkPassword(int $id, string $password): bool
    {
        $user = $this->users->findById($id);
        return $user && Hash::check($password, $user->password);
    }
}
