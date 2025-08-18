<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FavoriteService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    protected $service;

    public function __construct(FavoriteService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $favorites = $this->service->getUserFavorites(Auth::id());
        return response()->json(['message' => 'Favorites retrieved successfully', 'data' => $favorites]);
    }

    public function indexUserBooks(string $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $favorites = $this->service->getUserFavorites($user->id);
        return response()->json(['message' => 'Favorites retrieved successfully', 'data' => $favorites]);
    }

    public function store(Request $request)
    {
        $request->validate(['book_id' => 'required|exists:books,id']);
        $favorite = $this->service->addFavorite(Auth::id(), $request->book_id);
        if (!$favorite) {
            return response()->json(['message' => 'This book is already in your favorites'], 400);
        }
        return response()->json(['message' => 'Book added to favorites', 'data' => $favorite]);
    }

    public function show(string $id)
    {
        $favorite = $this->service->getFavorite((int)$id);
        if (!$favorite) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }
        return response()->json(['message' => 'Favorite retrieved successfully', 'data' => $favorite]);
    }

    public function update(Request $request, string $id)
    {
        $request->validate(['book_id' => 'required|exists:books,id']);
        $favorite = $this->service->updateFavorite((int)$id, ['book_id' => $request->book_id]);
        if (!$favorite) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }
        return response()->json(['message' => 'Favorite updated successfully', 'data' => $favorite]);
    }

    public function destroy(string $id)
    {
        $deleted = $this->service->removeFavorite((int)$id);
        if (!$deleted) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }
        return response()->json(['message' => 'Favorite removed successfully']);
    }

    public function destroyByBookId(Request $request)
    {
        $request->validate(['book_id' => 'required|integer|exists:books,id']);
        $deleted = $this->service->removeByBookId(Auth::id(), $request->book_id);
        if (!$deleted) {
            return response()->json(['message' => 'Favorite not found'], 404);
        }
        return response()->json(['message' => 'Favorite deleted successfully']);
    }
}
