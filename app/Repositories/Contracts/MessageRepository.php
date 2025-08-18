<?php

namespace App\Repositories\Contracts;

use App\Models\Message;

interface MessageRepository
{
    public function create(array $data);
    public function findById(int $id);
    public function update(int $id, array $data);
    public function delete(int $id): bool;
    public function markAsRead(array $messageIds): int;
}
