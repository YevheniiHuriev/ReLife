<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\ChatRepository;
use Illuminate\Support\Facades\Auth;

class ChatService
{
    protected ChatRepository $chatRepository;

    public function __construct(ChatRepository $chatRepository)
    {
        $this->chatRepository = $chatRepository;
    }

    public function getChatsForCurrentUser()
    {
        $userId = Auth::id();
        return $this->chatRepository->getUserChats($userId);
    }

    public function createChat(array $data)
    {
        $senderId = $data['sender_id'] ?? Auth::id();
        $receiverId = $data['receiver_id'];

        if (!User::find($senderId)) {
            throw new \Exception("Invalid sender_id provided.");
        }

        return $this->chatRepository->createChat($senderId, $receiverId, $data['title']);
    }

    public function getChatById(int $id)
    {
        return $this->chatRepository->findById($id);
    }

    public function deleteChat(int $id): bool
    {
        $userId = Auth::id();
        $chat = $this->chatRepository->findById($id);

        if (!$chat) {
            throw new \Exception("Chat not found.");
        }

        if ($chat->user_one_id !== $userId && $chat->user_two_id !== $userId) {
            throw new \Exception("Unauthorized");
        }

        return $this->chatRepository->deleteChat($chat);
    }

    public function hasMessages(int $chatId): bool
    {
        $chat = $this->chatRepository->findById($chatId);
        return $chat && $chat->messages->isNotEmpty();
    }

    public function findAdministrationChat(int $receiverId)
    {
        if (!User::find($receiverId)) {
            throw new \Exception("Invalid receiver ID.");
        }
        return $this->chatRepository->findAdministrationChat($receiverId);
    }
}
