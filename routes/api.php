<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthorController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserMuteController;
use App\Http\Controllers\Api\UserBanController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NoteController;

Route::post("register", [AuthController::class, "register"]);
Route::post("login", [AuthController::class, "login"])->middleware('ban');

Route::post("login/exist", [AuthController::class, "checkEmail"]);
Route::post("profile/check", [AuthController::class, "checkPassword"]);

Route::post("chats/delete", [ChatController::class, "deleteChatUsingPostMethod"]);

Route::get("books", [BookController::class, "index"]);
Route::get("books/{id}", [BookController::class, "show"]);

Route::get("authors", [AuthorController::class, "index"]);
Route::get("authors/{id}", [AuthorController::class, "show"]);

Route::get("genres", [GenreController::class, "index"]);
Route::get("genres/{id}", [GenreController::class, "show"]);

Route::get("users/{id}", [UserController::class, "show"]);

Route::get("comments", [CommentController::class, "index"]);
Route::get("purchases/user/{id}", [PurchaseController::class, "indexUserBooks"]);

Route::get("favorites/user/{id}", [FavoriteController::class, "indexUserBooks"]);
Route::get("favorites/{id}", [FavoriteController::class, "show"]);

Route::middleware("auth-admin")->group(function () {
    Route::post("books", [BookController::class, "store"]);
    Route::post("books/{id}", [BookController::class, "update"]);
    Route::delete("books/{id}", [BookController::class, "destroy"]);
    Route::post("users_admin/{id}", [UserController::class, "admin_update"]);

    Route::post("roles", [RoleController::class, "store"]);
    Route::post("roles/{id}", [RoleController::class, "update"]);
    Route::delete("roles/{id}", [RoleController::class, "destroy"]);

    Route::post("authors", [AuthorController::class, "store"]);
    Route::post("authors/{id}", [AuthorController::class, "update"]);
    Route::delete("authors/{id}", [AuthorController::class, "destroy"]);

    Route::post("genres", [GenreController::class, "store"]);
    Route::post("genres/{id}", [GenreController::class, "update"]);
    Route::delete("genres/{id}", [GenreController::class, "destroy"]);
});

Route::middleware("auth-moder")->group(function () {
    Route::get("reports", [ReportController::class, "index"]);

    Route::get("user_mutes", [UserMuteController::class, "index"]);
    Route::post("user_mutes/active", [UserMuteController::class, "show"]);
    Route::post("user_mutes", [UserMuteController::class, "store"]);
    Route::post("user_mutes/{id}", [UserMuteController::class, "update"]);
    Route::delete("user_mutes/{id}", [UserMuteController::class, "destroy"]);

    Route::get("user_bans", [UserBanController::class, "index"]);
    Route::post("user_bans/active", [UserBanController::class, "show"]);
    Route::post("user_bans", [UserBanController::class, "store"]);
    Route::post("user_bans/{id}", [UserBanController::class, "update"]);
    Route::delete("user_bans/{id}", [UserBanController::class, "destroy"]);
});

Route::middleware("auth-mute")->group(function () {
    Route::get("comments/{id}", [CommentController::class, "show"]);
    Route::post("comments", [CommentController::class, "store"]);
    Route::post("comments/{id}", [CommentController::class, "update"]);
    Route::delete("comments/{id}", [CommentController::class, "destroy"]);
    Route::get('comments/rep/{id}', [CommentController::class, 'checkReport']);
});

Route::middleware("auth:api")->group(function () {
    Route::get("profile", [AuthController::class, "profile"]);
    Route::get("logout", [AuthController::class, "logout"]);

    Route::get("purchases", [PurchaseController::class, "index"]);
    Route::get("purchases/{id}", [PurchaseController::class, "show"]);
    Route::post("purchases", [PurchaseController::class, "store"]);
    Route::post("purchases/{id}", [PurchaseController::class, "update"]);
    Route::delete("purchases/{id}", [PurchaseController::class, "destroy"]);

    Route::post("favorites/{id}", [FavoriteController::class, "update"]);
    Route::get("favorites", [FavoriteController::class, "index"]);
    Route::post("favorites", [FavoriteController::class, "store"]);
    Route::delete("favorites/{id}", [FavoriteController::class, "destroy"]);
    Route::delete("destroy_by_book_id", [FavoriteController::class, "destroyByBookId"]);

    Route::get("reports/{id}", [ReportController::class, "show"]);
    Route::post("reports", [ReportController::class, "store"]);
    Route::post("reports/{id}", [ReportController::class, "update"]);
    Route::delete("reports/{id}", [ReportController::class, "destroy"]);

    Route::get("users", [UserController::class, "index"]);
    Route::post("users", [UserController::class, "store"]);
    Route::post("users/{id}", [UserController::class, "update"]);
    Route::delete("users/{id}", [UserController::class, "destroy"]);
    Route::get("system_bot", [UserController::class, 'getSystemBotId']);

    Route::get("roles", [RoleController::class, "index"]);
    Route::get("roles/{id}", [RoleController::class, "show"]);

    Route::get("chats", [ChatController::class, "index"]);
    Route::get("chats/{id}", [ChatController::class, "show"]);
    Route::get("chats/hasMessages/{id}", [ChatController::class, "hasMessages"]);
    Route::post("chats", [ChatController::class, "store"]);
    Route::delete("chats/{id}", [ChatController::class, "destroy"]);
    Route::post("administration", [ChatController::class, 'findAdministrationChat']);

    Route::post("messages", [MessageController::class, "store"]);
    Route::post("messages/{id}", [MessageController::class, "update"]);
    Route::delete("messages/{id}", [MessageController::class, "destroy"]);
    Route::post("markAsRead", [MessageController::class, "markAsRead"]);

    Route::get("notes/{id}", [NoteController::class, "index"]);
    Route::get("notes/{id}", [NoteController::class, "show"]);
    Route::post("notes", [NoteController::class, "store"]);
    Route::post("notes/{id}", [NoteController::class, "update"]);
    Route::delete("notes/{id}", [NoteController::class, "destroy"]);
});

Route::fallback(function () {
    return response()->json([
        'message' => 'API route not found.'
    ], 200);
});
