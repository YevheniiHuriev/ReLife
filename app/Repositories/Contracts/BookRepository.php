<?php

namespace App\Repositories\Contracts;

use App\Models\Book;

interface BookRepository
{
    public function allWithRelations();
    public function create(array $data): Book;
    public function findWithRelations(int $id): ?Book;
    public function findById(int $id): ?Book;
    public function update(int $id, array $data): ?Book;
    public function delete(int $id): bool;
}
