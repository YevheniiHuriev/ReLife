<?php

namespace App\Repositories\Eloquent;

use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepository;

class EloquentPurchaseRepository implements PurchaseRepository
{
    public function getByUserWithBooks(int $userId)
    {
        return Purchase::where('user_id', $userId)->with('book')->get();
    }

    public function create(array $data): Purchase
    {
        return Purchase::create($data);
    }

    public function findByUserAndBook(int $userId, int $bookId): ?Purchase
    {
        return Purchase::where('user_id', $userId)
            ->where('book_id', $bookId)
            ->first();
    }

    public function findById(int $id): ?Purchase
    {
        return Purchase::find($id);
    }

    public function update(int $id, array $data): ?Purchase
    {
        $purchase = Purchase::find($id);
        if (!$purchase) return null;

        $purchase->update($data);
        return $purchase;
    }

    public function delete(int $id): bool
    {
        $purchase = Purchase::find($id);
        if (!$purchase) return false;

        return $purchase->delete();
    }
}
