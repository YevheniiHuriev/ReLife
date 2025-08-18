<?php

namespace App\Services;

use App\Repositories\Contracts\FavoriteRepository;
use App\Models\Favorite;
use Illuminate\Database\Eloquent\Collection;

class FavoriteService
{
    protected $favorites;

    public function __construct(FavoriteRepository $favorites)
    {
        $this->favorites = $favorites;
    }

    public function getUserFavorites(int $userId): Collection
    {
        return $this->favorites->getUserFavoritesWithBooks($userId);
    }

    public function getFavorite(int $id): ?Favorite
    {
        return $this->favorites->findById($id);
    }

    public function addFavorite(int $userId, int $bookId): ?Favorite
    {
        $existing = $this->favorites->findByUserAndBook($userId, $bookId);
        if ($existing) {
            return null;
        }
        return $this->favorites->create(['user_id' => $userId, 'book_id' => $bookId]);
    }

    public function updateFavorite(int $id, array $data): ?Favorite
    {
        $favorite = $this->favorites->findById($id);
        if (!$favorite) {
            return null;
        }
        return $this->favorites->update($favorite, $data);
    }

    public function removeFavorite(int $id): bool
    {
        $favorite = $this->favorites->findById($id);
        if (!$favorite) {
            return false;
        }
        return $this->favorites->delete($favorite);
    }

    public function removeByBookId(int $userId, int $bookId): bool
    {
        $favorite = $this->favorites->findByUserAndBook($userId, $bookId);
        if (!$favorite) {
            return false;
        }
        return $this->favorites->delete($favorite);
    }
}
