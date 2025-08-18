<?php

namespace App\Repositories\Contracts;

use App\Models\Role;

interface RoleRepository
{
    public function getReaderRoleId(): int;
    public function all();
    public function create(array $data): Role;
    public function findById(int $id): ?Role;
    public function update(int $id, array $data): ?Role;
    public function delete(int $id): bool;
}
