<?php

namespace App\Services;

use App\Repositories\Contracts\RoleRepository;
use Illuminate\Support\Facades\Validator;

class RoleService
{
    protected RoleRepository $roles;

    public function __construct(RoleRepository $roles)
    {
        $this->roles = $roles;
    }

    public function getAll()
    {
        return ['data' => $this->roles->all(), 'status' => 200];
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|unique:roles|max:255',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $role = $this->roles->create(['name' => $data['name']]);
        return ['data' => $role, 'status' => 201];
    }

    public function getById(int $id)
    {
        $role = $this->roles->findById($id);

        if (!$role) {
            return ['message' => 'Role not found', 'status' => 404];
        }

        return ['data' => $role, 'status' => 200];
    }

    public function update(int $id, array $data)
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|unique:roles,name,' . $id . '|max:255',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $role = $this->roles->update($id, ['name' => $data['name']]);

        if (!$role) {
            return ['message' => 'Role not found', 'status' => 404];
        }

        return ['data' => $role, 'status' => 200];
    }

    public function delete(int $id)
    {
        $deleted = $this->roles->delete($id);

        if (!$deleted) {
            return ['message' => 'Role not found', 'status' => 404];
        }

        return ['message' => 'Role deleted successfully', 'status' => 200];
    }
}
