<?php

namespace App\Repositories\Eloquent;

use App\Models\Book;
use App\Repositories\Contracts\BookRepository;

class EloquentBookRepository implements BookRepository
{
    public function allWithRelations()
    {
        return Book::with(['authors', 'genres'])->get();
    }

    public function create(array $data): Book
    {
        return Book::create($data);
    }

    public function findWithRelations(int $id): ?Book
    {
        return Book::with(['authors', 'genres'])->find($id);
    }

    public function findById(int $id): ?Book
    {
        return Book::find($id);
    }

    public function update(int $id, array $data): ?Book
    {
        $book = Book::find($id);
        if (!$book) return null;

        $book->update($data);
        return $book;
    }

    public function delete(int $id): bool
    {
        $book = Book::find($id);
        if (!$book) return false;

        return $book->delete();
    }
}
