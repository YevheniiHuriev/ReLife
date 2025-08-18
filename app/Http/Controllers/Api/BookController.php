<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\BookService;

class BookController extends Controller
{
    protected BookService $books;

    public function __construct(BookService $books)
    {
        $this->books = $books;
    }

    public function index()
    {
        $books = $this->books->getAll();
        return response()->json(['success' => true, 'data' => $books], 200);
    }

    public function store(Request $request)
    {
        $result = $this->books->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 201) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Book added successfully', 'data' => $result['data']], 201);
    }

    public function show(string $id)
    {
        $result = $this->books->getById((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'data' => $result['data']], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->books->update((int) $id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Book updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->books->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => $result['message']], 200);
    }
}
