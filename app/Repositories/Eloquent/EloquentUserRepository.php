<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepository;

class EloquentUserRepository implements UserRepository
{
    public function allWithRole()
    {
        return User::with('role')->get();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function findByIdWithRole(int $id): ?User
    {
        return User::with('role')->find($id);
    }

    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function update(int $id, array $data): ?User
    {
        $user = User::find($id);
        if (!$user) return null;

        $user->update($data);
        return $user;
    }

    public function delete(int $id): bool
    {
        $user = User::find($id);
        if (!$user) return false;

        return (bool) $user->delete();
    }

    public function findFirstIdByRoleName(string $roleName): ?int
    {
        $user = User::whereHas('role', function ($q) use ($roleName) {
            $q->where('name', $roleName);
        })->first();

        return $user?->id;
    }
}
