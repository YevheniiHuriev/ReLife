<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface AuthRepository
{
    public function create(array $data): User;
    public function findByEmail(string $email): ?User;
    public function findById(int $id): ?User;
    public function existsByEmail(string $email): bool;
}
