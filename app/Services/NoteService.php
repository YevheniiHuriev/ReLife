<?php

namespace App\Services;

use App\Repositories\Contracts\NoteRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\Note;

class NoteService
{
    protected $notes;

    public function __construct(NoteRepository $notes)
    {
        $this->notes = $notes;
    }

    public function getUserNotes()
    {
        $userId = Auth::id();
        return $this->notes->getUserNotesWithBook($userId);
    }

    public function createNote(array $data): Note
    {
        $userId = Auth::id();
        $data['user_id'] = $userId;

        return $this->notes->create($data);
    }

    public function getNoteByBook(int $bookId): ?Note
    {
        $userId = Auth::id();
        return $this->notes->findByUserAndBook($userId, $bookId);
    }

    public function updateNote(int $bookId, array $data): ?Note
    {
        $userId = Auth::id();
        $note = $this->notes->findByUserAndBook($userId, $bookId);

        if (!$note) {
            return null;
        }

        return $this->notes->update($note, $data);
    }

    public function deleteNote(int $id): bool
    {
        $note = $this->notes->findById($id);

        if (!$note) {
            return false;
        }

        return $this->notes->delete($note);
    }
}
