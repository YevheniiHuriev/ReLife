<?php

namespace App\Services;

use App\Repositories\Contracts\PurchaseRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PurchaseService
{
    protected PurchaseRepository $purchases;

    public function __construct(PurchaseRepository $purchases)
    {
        $this->purchases = $purchases;
    }

    public function getUserPurchases()
    {
        $user = Auth::user();
        return ['data' => $this->purchases->getByUserWithBooks($user->id), 'status' => 200];
    }

    public function getUserPurchasesById(int $id)
    {
        $purchases = $this->purchases->getByUserWithBooks($id);

        if ($purchases->isEmpty()) {
            return ['message' => 'User not found or has no purchases', 'status' => 404];
        }

        return ['data' => $purchases, 'status' => 200];
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'book_id' => 'required|exists:books,id',
            'is_completed' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $user = Auth::user();

        $purchase = $this->purchases->create([
            'user_id' => $user->id,
            'book_id' => $data['book_id'],
            'is_completed' => $data['is_completed']
        ]);

        return ['data' => $purchase, 'status' => 201];
    }

    public function getByBookId(int $bookId)
    {
        $user = Auth::user();

        $purchase = $this->purchases->findByUserAndBook($user->id, $bookId);

        if (!$purchase) {
            return ['message' => 'Purchase not found', 'status' => 404];
        }

        return ['data' => $purchase, 'status' => 200];
    }

    public function update(int $id, array $data)
    {
        $validator = Validator::make($data, [
            'is_completed' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $purchase = $this->purchases->update($id, ['is_completed' => $data['is_completed']]);

        if (!$purchase) {
            return ['message' => 'Purchase not found', 'status' => 404];
        }

        return ['data' => $purchase, 'status' => 200];
    }

    public function delete(int $id)
    {
        $deleted = $this->purchases->delete($id);

        if (!$deleted) {
            return ['message' => 'Purchase not found', 'status' => 404];
        }

        return ['message' => 'Purchase removed successfully', 'status' => 200];
    }
}
