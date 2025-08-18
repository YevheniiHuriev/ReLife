<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MessageService;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    protected $messageService;

    public function __construct(MessageService $messageService)
    {
        $this->messageService = $messageService;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'content' => 'required|string',
            'sender_id' => 'nullable|exists:users,id',
        ]);

        $result = $this->messageService->create($data);

        return response()->json($result, $result['status']);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'content' => 'required|string',
        ]);

        $result = $this->messageService->update($id, $data);

        return response()->json($result, $result['status']);
    }

    public function destroy($id)
    {
        $result = $this->messageService->delete($id);

        return response()->json($result, $result['status']);
    }

    public function markAsRead(Request $request)
    {
        $messageIds = $request->input('message_ids', []);

        $result = $this->messageService->markAsRead($messageIds);

        return response()->json($result, $result['status']);
    }
}
