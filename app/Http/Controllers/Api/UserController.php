<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\UserService;

class UserController extends Controller
{
    protected UserService $users;

    public function __construct(UserService $users)
    {
        $this->users = $users;
    }

    public function index()
    {
        $users = $this->users->getAll();
        return response()->json(['success' => true, 'data' => $users], 200);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $photo = $request->file('photo');

        $result = $this->users->create($data, $photo);

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'User created successfully', 'data' => $result['data']], 201);
    }

    public function show(string $id)
    {
        $result = $this->users->getById((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'data' => $result['data']], 200);
    }

    public function update(Request $request, string $id)
    {
        $data = $request->all();
        $photo = $request->file('photo');

        $result = $this->users->update((int) $id, $data, $photo);

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'User updated successfully', 'data' => $result['data']], 200);
    }

    public function admin_update(Request $request, string $id)
    {
        $data = $request->all();
        $photo = $request->file('photo');

        $result = $this->users->adminUpdate((int) $id, $data, $photo);

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'User updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->users->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message'], 'error' => $result['error'] ?? null], $result['status']);
        }

        return response()->json(['success' => true, 'message' => $result['message']], 200);
    }

    public function getSystemBotId()
    {
        $result = $this->users->getSystemBotId();

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], 404);
        }

        return response()->json(['success' => true, 'bot_id' => $result['bot_id']], 200);
    }
}
