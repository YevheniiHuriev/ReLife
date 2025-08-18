<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\UserMuteService;
use Illuminate\Support\Facades\Auth;

class UserMuteController extends Controller
{
    protected UserMuteService $mutes;

    public function __construct(UserMuteService $mutes)
    {
        $this->mutes = $mutes;
    }

    public function index()
    {
        $user = Auth::user();
        $mutes = $this->mutes->getAllForUser($user->id);

        return response()->json(['success' => true, 'data' => $mutes], 200);
    }

    public function store(Request $request)
    {
        $result = $this->mutes->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'User muted successfully', 'data' => $result['data']], 201);
    }

    public function show(Request $request)
    {
        $result = $this->mutes->getByUserId((int) $request->userId, $request->input('userTimeZone'));

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if (isset($result['data'])) {
            return response()->json(['success' => true, 'data' => $result['data']], 200);
        }

        return response()->json(['success' => false, 'message' => $result['message'], 'expired' => $result['expired']], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->mutes->update((int) $id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Mute record updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->mutes->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => $result['message']], 200);
    }
}
