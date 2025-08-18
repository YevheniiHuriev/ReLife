<?php

namespace App\Repositories\Contracts;

use App\Models\Author;

interface AuthorRepository
{
    public function all();
    public function create(array $data): Author;
    public function findWithBooks(int $id): ?Author;
    public function findById(int $id): ?Author;
    public function update(int $id, array $data): ?Author;
    public function delete(int $id): bool;
}
