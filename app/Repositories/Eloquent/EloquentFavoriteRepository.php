<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\FavoriteRepository;
use App\Models\Favorite;
use Illuminate\Database\Eloquent\Collection;

class EloquentFavoriteRepository implements FavoriteRepository
{
    public function getUserFavoritesWithBooks(int $userId): Collection
    {
        return Favorite::where('user_id', $userId)->with('book')->get();
    }

    public function findById(int $id): ?Favorite
    {
        return Favorite::find($id);
    }

    public function findByUserAndBook(int $userId, int $bookId): ?Favorite
    {
        return Favorite::where('user_id', $userId)->where('book_id', $bookId)->first();
    }

    public function create(array $data): Favorite
    {
        return Favorite::create($data);
    }

    public function update(Favorite $favorite, array $data): Favorite
    {
        $favorite->update($data);
        return $favorite;
    }

    public function delete(Favorite $favorite): bool
    {
        return $favorite->delete();
    }
}
