<?php

namespace App\Repositories\Eloquent;

use App\Models\Message;
use App\Repositories\Contracts\MessageRepository;

class EloquentMessageRepository implements MessageRepository
{
    public function create(array $data)
    {
        return Message::create($data);
    }

    public function findById(int $id)
    {
        return Message::find($id);
    }

    public function update(int $id, array $data)
    {
        $message = Message::findOrFail($id);
        $message->update($data);
        return $message;
    }

    public function delete(int $id): bool
    {
        $message = Message::findOrFail($id);
        return $message->delete();
    }

    public function markAsRead(array $messageIds): int
    {
        return Message::whereIn('id', $messageIds)
            ->where('is_checked', false)
            ->update(['is_checked' => true]);
    }
}
