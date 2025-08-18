<?php

namespace App\Repositories\Eloquent;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepository;

class EloquentRoleRepository implements RoleRepository
{
    public function getReaderRoleId(): int
    {
        return Role::where('name', 'reader')->value('id');
    }

    public function all()
    {
        return Role::all();
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function findById(int $id): ?Role
    {
        return Role::find($id);
    }

    public function update(int $id, array $data): ?Role
    {
        $role = Role::find($id);
        if (!$role) return null;

        $role->update($data);
        return $role;
    }

    public function delete(int $id): bool
    {
        $role = Role::find($id);
        if (!$role) return false;

        return $role->delete();
    }
}
