<?php

namespace App\Repositories\Eloquent;

use App\Models\Genre;
use App\Repositories\Contracts\GenreRepository;

class EloquentGenreRepository implements GenreRepository
{
    public function all()
    {
        return Genre::all();
    }

    public function find(string $id): ?Genre
    {
        return Genre::with('books')->find($id);
    }

    public function create(array $data): Genre
    {
        return Genre::create($data);
    }

    public function update(Genre $genre, array $data): Genre
    {
        $genre->update($data);
        return $genre;
    }

    public function delete(Genre $genre): bool
    {
        $genre->books()->detach();
        return $genre->delete();
    }
}
