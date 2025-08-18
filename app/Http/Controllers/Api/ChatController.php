<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    public function index()
    {
        return response()->json($this->chatService->getChatsForCurrentUser());
    }

    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
        ]);

        try {
            $chat = $this->chatService->createChat($request->all());
            return response()->json(['message' => 'Chat created successfully!', 'chat' => $chat], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show($id)
    {
        $chat = $this->chatService->getChatById($id);
        return $chat
            ? response()->json($chat)
            : response()->json(['error' => 'Chat not found'], 404);
    }

    public function destroy($id)
    {
        try {
            $this->chatService->deleteChat($id);
            return response()->json(['message' => 'Chat and its messages deleted successfully!']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    public function deleteChatUsingPostMethod(Request $request)
    {
        $request->validate(['chat_id' => 'required|integer']);
        return $this->destroy($request->chat_id);
    }

    public function hasMessages($chatId)
    {
        $exist = $this->chatService->hasMessages($chatId);
        return response()->json(['success' => true, 'exist' => $exist]);
    }

    public function findAdministrationChat(Request $request)
    {
        $request->validate(['receiver_id' => 'required|integer']);

        try {
            $chat = $this->chatService->findAdministrationChat($request->receiver_id);
            return $chat
                ? response()->json(['success' => true, 'chat_id' => $chat->id])
                : response()->json(['success' => false, 'message' => 'No Administration chat found']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }
}
