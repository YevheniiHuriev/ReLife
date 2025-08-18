<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Repositories\Contracts\AuthRepository;
use App\Repositories\Contracts\RoleRepository;
use App\Repositories\Contracts\AuthorRepository;
use App\Repositories\Contracts\BookRepository;
use App\Repositories\Contracts\ChatRepository;
use App\Repositories\Contracts\CommentRepository;
use App\Repositories\Contracts\FavoriteRepository;
use App\Repositories\Contracts\GenreRepository;
use App\Repositories\Contracts\MessageRepository;
use App\Repositories\Contracts\NoteRepository;
use App\Repositories\Contracts\PurchaseRepository;
use App\Repositories\Contracts\ReportRepository;
use App\Repositories\Contracts\UserBanRepository;
use App\Repositories\Contracts\UserRepository;
use App\Repositories\Contracts\UserMuteRepository;


use App\Repositories\Eloquent\EloquentAuthRepository;
use App\Repositories\Eloquent\EloquentRoleRepository;
use App\Repositories\Eloquent\EloquentAuthorRepository;
use App\Repositories\Eloquent\EloquentBookRepository;
use App\Repositories\Eloquent\EloquentChatRepository;
use App\Repositories\Eloquent\EloquentCommentRepository;
use App\Repositories\Eloquent\EloquentFavoriteRepository;
use App\Repositories\Eloquent\EloquentGenreRepository;
use App\Repositories\Eloquent\EloquentMessageRepository;
use App\Repositories\Eloquent\EloquentNoteRepository;
use App\Repositories\Eloquent\EloquentPurchaseRepository;
use App\Repositories\Eloquent\EloquentReportRepository;
use App\Repositories\Eloquent\EloquentUserBanRepository;
use App\Repositories\Eloquent\EloquentUserRepository;
use App\Repositories\Eloquent\EloquentUserMuteRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(AuthRepository::class, EloquentAuthRepository::class);
        $this->app->bind(RoleRepository::class, EloquentRoleRepository::class);
        $this->app->bind(AuthorRepository::class, EloquentAuthorRepository::class);
        $this->app->bind(BookRepository::class, EloquentBookRepository::class);
        $this->app->bind(ChatRepository::class, EloquentChatRepository::class);
        $this->app->bind(CommentRepository::class, EloquentCommentRepository::class);
        $this->app->bind(FavoriteRepository::class, EloquentFavoriteRepository::class);
        $this->app->bind(GenreRepository::class, EloquentGenreRepository::class);
        $this->app->bind(MessageRepository::class, EloquentMessageRepository::class);
        $this->app->bind(NoteRepository::class, EloquentNoteRepository::class);
        $this->app->bind(PurchaseRepository::class, EloquentPurchaseRepository::class);
        $this->app->bind(ReportRepository::class, EloquentReportRepository::class);
        $this->app->bind(UserBanRepository::class, EloquentUserBanRepository::class);
        $this->app->bind(UserRepository::class, EloquentUserRepository::class);
        $this->app->bind(UserMuteRepository::class, EloquentUserMuteRepository::class);
    }
}
