<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\Note;

interface NoteRepository
{
    public function getUserNotesWithBook(int $userId): Collection;
    public function create(array $data): Note;
    public function findByUserAndBook(int $userId, int $bookId): ?Note;
    public function update(Note $note, array $data): Note;
    public function findById(int $id): ?Note;
    public function delete(Note $note): bool;
}
