<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PurchaseService;

class PurchaseController extends Controller
{
    protected PurchaseService $purchases;

    public function __construct(PurchaseService $purchases)
    {
        $this->purchases = $purchases;
    }

    public function index()
    {
        $result = $this->purchases->getUserPurchases();
        return response()->json(['message' => 'Purchases retrieved successfully', 'data' => $result['data']], $result['status']);
    }

    public function indexUserBooks(string $id)
    {
        $result = $this->purchases->getUserPurchasesById((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json(['message' => 'Purchases retrieved successfully', 'data' => $result['data']], 200);
    }

    public function store(Request $request)
    {
        $result = $this->purchases->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'Purchase created successfully', 'data' => $result['data']], 201);
    }

    public function show(string $bookId)
    {
        $result = $this->purchases->getByBookId((int) $bookId);

        if ($result['status'] !== 200) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json(['message' => 'Purchase retrieved successfully', 'data' => $result['data']], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->purchases->update((int) $id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json(['message' => 'Purchase updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->purchases->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json(['message' => $result['message']], 200);
    }
}
