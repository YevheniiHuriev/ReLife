<?php

namespace App\Repositories\Eloquent;

use App\Models\Author;
use App\Repositories\Contracts\AuthorRepository;

class EloquentAuthorRepository implements AuthorRepository
{
    public function all()
    {
        return Author::all();
    }

    public function create(array $data): Author
    {
        return Author::create($data);
    }

    public function findWithBooks(int $id): ?Author
    {
        return Author::with('books')->find($id);
    }

    public function findById(int $id): ?Author
    {
        return Author::find($id);
    }

    public function update(int $id, array $data): ?Author
    {
        $author = Author::find($id);
        if (!$author) return null;

        $author->update($data);
        return $author;
    }

    public function delete(int $id): bool
    {
        $author = Author::find($id);
        if (!$author) return false;

        $author->books()->detach();
        return $author->delete();
    }
}
