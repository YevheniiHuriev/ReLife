<?php

namespace App\Repositories\Eloquent;

use App\Models\Chat;
use App\Repositories\Contracts\ChatRepository;

class EloquentChatRepository implements ChatRepository
{
    public function getUserChats(int $userId)
    {
        return Chat::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne', 'userTwo', 'messages'])
            ->get();
    }

    public function createChat(int $senderId, int $receiverId, string $title): Chat
    {
        return Chat::create([
            'user_one_id' => $senderId,
            'user_two_id' => $receiverId,
            'title' => $title,
        ]);
    }

    public function findById(int $id): ?Chat
    {
        return Chat::with(['userOne', 'userTwo', 'messages.sender'])->find($id);
    }

    public function deleteChat(Chat $chat): bool
    {
        $chat->messages()->delete();
        return $chat->delete();
    }

    public function findAdministrationChat(int $receiverId): ?Chat
    {
        return Chat::where(function ($query) use ($receiverId) {
            $query->where('user_one_id', $receiverId)
                ->orWhere('user_two_id', $receiverId);
        })->where('title', 'Administration')->first();
    }
}
