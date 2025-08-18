<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use App\Models\Favorite;

interface FavoriteRepository
{
    public function getUserFavoritesWithBooks(int $userId): Collection;
    public function findById(int $id): ?Favorite;
    public function findByUserAndBook(int $userId, int $bookId): ?Favorite;
    public function create(array $data): Favorite;
    public function update(Favorite $favorite, array $data): Favorite;
    public function delete(Favorite $favorite): bool;
}
