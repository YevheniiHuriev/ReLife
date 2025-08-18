<?php

namespace App\Repositories\Contracts;

use App\Models\UserBan;

interface UserBanRepository
{
    public function allWithUser();
    public function create(array $data): UserBan;
    public function findById(int $id): ?UserBan;
    public function findByUserId(int $userId): ?UserBan;
    public function update(int $id, array $data): ?UserBan;
    public function delete(int $id): bool;
}
