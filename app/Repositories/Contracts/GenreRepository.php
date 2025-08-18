<?php

namespace App\Repositories\Contracts;

use App\Models\Genre;

interface GenreRepository
{
    public function all();
    public function find(string $id): ?Genre;
    public function create(array $data): Genre;
    public function update(Genre $genre, array $data): Genre;
    public function delete(Genre $genre): bool;
}
