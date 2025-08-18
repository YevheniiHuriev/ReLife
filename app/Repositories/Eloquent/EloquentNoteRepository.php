<?php

namespace App\Repositories\Eloquent;

use App\Models\Note;
use App\Repositories\Contracts\NoteRepository;
use Illuminate\Database\Eloquent\Collection;

class EloquentNoteRepository implements NoteRepository
{
    public function getUserNotesWithBook(int $userId): Collection
    {
        return Note::where('user_id', $userId)
            ->with('book')
            ->get();
    }

    public function create(array $data): Note
    {
        return Note::create($data);
    }

    public function findByUserAndBook(int $userId, int $bookId): ?Note
    {
        return Note::where('user_id', $userId)
            ->where('book_id', $bookId)
            ->first();
    }

    public function update(Note $note, array $data): Note
    {
        $note->update($data);
        return $note;
    }

    public function findById(int $id): ?Note
    {
        return Note::find($id);
    }

    public function delete(Note $note): bool
    {
        return $note->delete();
    }
}
