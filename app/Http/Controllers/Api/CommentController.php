<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CommentService;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    protected CommentService $comments;

    public function __construct(CommentService $comments)
    {
        $this->comments = $comments;
    }

    public function index()
    {
        return response()->json(['success' => true, 'data' => $this->comments->getAll()]);
    }

    public function store(Request $request)
    {
        $result = $this->comments->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'Comment created successfully', 'data' => $result], 201);
    }

    public function show(string $id)
    {
        $comment = $this->comments->getById($id);

        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Comment not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $comment]);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->comments->update($id, $request->all());

        if ($result === null) {
            return response()->json(['success' => false, 'message' => 'Comment not found'], 404);
        }

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'Comment updated successfully', 'data' => $result]);
    }

    public function destroy(string $id)
    {
        $result = $this->comments->delete($id);

        if ($result === null) {
            return response()->json(['success' => false, 'message' => 'Comment not found'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Comment deleted successfully']);
    }

    public function checkReport(string $id)
    {
        $hasReport = $this->comments->checkReport($id);

        return response()->json(['success' => true, 'has_report' => $hasReport]);
    }
}
