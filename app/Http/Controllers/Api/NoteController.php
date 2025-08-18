<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NoteService;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    protected $notes;

    public function __construct(NoteService $notes)
    {
        $this->notes = $notes;
    }

    public function index()
    {
        $notes = $this->notes->getUserNotes();

        return response()->json([
            'message' => 'Notes retrieved successfully',
            'data' => $notes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'note'    => 'required|string'
        ]);

        $note = $this->notes->createNote($request->only(['book_id', 'note']));

        return response()->json([
            'success' => true,
            'message' => 'Note created successfully',
            'data' => $note
        ]);
    }

    public function show(string $bookId)
    {
        $note = $this->notes->getNoteByBook((int)$bookId);

        if (!$note) {
            return response()->json([
                'success' => false,
                'message' => 'Note not found for this book',
                'data' => null
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Note retrieved successfully',
            'data' => $note
        ]);
    }

    public function update(Request $request, string $bookId)
    {
        $request->validate([
            'note' => 'required|string'
        ]);

        $note = $this->notes->updateNote((int)$bookId, $request->only('note'));

        if (!$note) {
            return response()->json([
                'success' => false,
                'message' => 'Note not found for this book'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Note updated successfully',
            'data' => $note
        ]);
    }

    public function destroy(string $id)
    {
        $deleted = $this->notes->deleteNote((int)$id);

        if (!$deleted) {
            return response()->json([
                'message' => 'Note not found'
            ], 404);
        }

        return response()->json([
            'message' => 'Note removed successfully'
        ]);
    }
}
