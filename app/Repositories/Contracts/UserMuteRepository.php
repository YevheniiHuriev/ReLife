<?php

namespace App\Repositories\Contracts;

use App\Models\UserMute;

interface UserMuteRepository
{
    public function allForUser(int $userId);
    public function create(array $data): UserMute;
    public function findById(int $id): ?UserMute;
    public function findByUserId(int $userId): ?UserMute;
    public function update(int $id, array $data): ?UserMute;
    public function delete(int $id): bool;
}
