<?php

namespace App\Services;

use App\Repositories\MessageRepository;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MessageService
{
    protected $messageRepository;

    public function __construct(MessageRepository $messageRepository)
    {
        $this->messageRepository = $messageRepository;
    }

    public function create(array $data)
    {
        $senderId = $data['sender_id'] ?? Auth::id();

        if (!User::where('id', $senderId)->exists()) {
            return ['error' => 'Invalid sender_id provided.', 'status' => 422];
        }

        $data['sender_id'] = $senderId;
        $data['is_checked'] = false;

        $message = $this->messageRepository->create($data);

        return ['message' => 'Message sent successfully!', 'data' => $message, 'status' => 201];
    }

    public function update(int $id, array $data)
    {
        $message = $this->messageRepository->findById($id);

        if (!$message) {
            return ['error' => 'Message not found.', 'status' => 404];
        }

        if ($message->sender_id !== Auth::id()) {
            return ['error' => 'Unauthorized', 'status' => 403];
        }

        $message = $this->messageRepository->update($id, $data);

        return ['message' => 'Message updated successfully!', 'data' => $message, 'status' => 200];
    }

    public function delete(int $id)
    {
        $message = $this->messageRepository->findById($id);

        if (!$message) {
            return ['error' => 'Message not found.', 'status' => 404];
        }

        if ($message->sender_id !== Auth::id()) {
            return ['error' => 'Unauthorized', 'status' => 403];
        }

        $this->messageRepository->delete($id);

        return ['message' => 'Message deleted successfully!', 'status' => 200];
    }

    public function markAsRead(array $messageIds)
    {
        if (empty($messageIds)) {
            return ['error' => 'Invalid data.', 'status' => 400];
        }

        $updated = $this->messageRepository->markAsRead($messageIds);

        return [
            'message' => 'Messages marked as read.',
            'updated_count' => $updated,
            'status' => 200
        ];
    }
}
