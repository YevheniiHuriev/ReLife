<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AuthorService;

class AuthorController extends Controller
{
    protected AuthorService $authors;

    public function __construct(AuthorService $authors)
    {
        $this->authors = $authors;
    }

    public function index()
    {
        $authors = $this->authors->getAll();
        return response()->json(['success' => true, 'data' => $authors], 200);
    }

    public function store(Request $request)
    {
        $result = $this->authors->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'Author created successfully', 'data' => $result['data']], 201);
    }

    public function show(string $id)
    {
        $result = $this->authors->getById((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'data' => $result['data']], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->authors->update((int) $id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Author updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->authors->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => $result['message']], 200);
    }
}
