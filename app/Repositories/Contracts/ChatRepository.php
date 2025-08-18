<?php

namespace App\Repositories\Contracts;

use App\Models\Chat;

interface ChatRepository
{
    public function getUserChats(int $userId);
    public function createChat(int $senderId, int $receiverId, string $title): Chat;
    public function findById(int $id): ?Chat;
    public function deleteChat(Chat $chat): bool;
    public function findAdministrationChat(int $receiverId): ?Chat;
}
