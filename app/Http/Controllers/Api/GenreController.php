<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\GenreService;

class GenreController extends Controller
{
    protected $service;

    public function __construct(GenreService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $genres = $this->service->getAll();
        return response()->json(['success' => true, 'data' => $genres], 200);
    }

    public function store(Request $request)
    {
        $result = $this->service->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Genre created successfully', 'data' => $result['data']], $result['status']);
    }

    public function show(string $id)
    {
        $genre = $this->service->findById($id);
        if (!$genre) {
            return response()->json(['success' => false, 'message' => 'Genre not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $genre], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->service->update($id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], $result['status']);
        }

        if (isset($result['message']) && $result['status'] === 404) {
            return response()->json(['success' => false, 'message' => $result['message']], 404);
        }

        return response()->json(['success' => true, 'message' => 'Genre updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->service->delete($id);

        return response()->json([
            'success' => $result['status'] === 200,
            'message' => $result['message'] ?? 'Error',
            'error'   => $result['error'] ?? null,
        ], $result['status']);
    }
}
