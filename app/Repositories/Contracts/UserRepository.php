<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepository
{
    public function allWithRole();
    public function create(array $data): User;
    public function findByIdWithRole(int $id): ?User;
    public function findById(int $id): ?User;
    public function update(int $id, array $data): ?User;
    public function delete(int $id): bool;
    public function findFirstIdByRoleName(string $roleName): ?int;
}
