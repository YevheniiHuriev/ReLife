<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\UserBanService;

class UserBanController extends Controller
{
    protected UserBanService $bans;

    public function __construct(UserBanService $bans)
    {
        $this->bans = $bans;
    }

    public function index()
    {
        $result = $this->bans->getAll();
        return response()->json(['message' => 'Banned users retrieved successfully', 'data' => $result['data']], $result['status']);
    }

    public function store(Request $request)
    {
        $result = $this->bans->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'User banned successfully', 'data' => $result['data']], 201);
    }

    public function show(Request $request)
    {
        $result = $this->bans->getByUserId((int) $request->userId, $request->input('userTimeZone'));

        if ($result['active']) {
            return response()->json(['success' => true, 'message' => 'Active ban record retrieved successfully', 'data' => $result['data']], 200);
        }

        return response()->json(['message' => $result['message'], 'expired' => $result['expired']], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->bans->update((int) $id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json(['message' => 'Ban record updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->bans->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json(['message' => $result['message']], 200);
    }
}
