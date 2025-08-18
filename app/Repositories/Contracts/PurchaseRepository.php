<?php

namespace App\Repositories\Contracts;

use App\Models\Purchase;

interface PurchaseRepository
{
    public function getByUserWithBooks(int $userId);
    public function create(array $data): Purchase;
    public function findByUserAndBook(int $userId, int $bookId): ?Purchase;
    public function findById(int $id): ?Purchase;
    public function update(int $id, array $data): ?Purchase;
    public function delete(int $id): bool;
}
