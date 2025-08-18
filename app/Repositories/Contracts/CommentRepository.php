<?php

namespace App\Repositories\Contracts;

use App\Models\Comment;

interface CommentRepository
{
    public function all();
    public function find(string $id): ?Comment;
    public function create(array $data): Comment;
    public function update(Comment $comment, array $data): Comment;
    public function delete(Comment $comment): bool;
}
