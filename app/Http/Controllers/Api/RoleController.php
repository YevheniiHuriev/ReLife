<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\RoleService;

class RoleController extends Controller
{
    protected RoleService $roles;

    public function __construct(RoleService $roles)
    {
        $this->roles = $roles;
    }

    public function index()
    {
        $result = $this->roles->getAll();
        return response()->json(['success' => true, 'message' => 'Roles retrieved successfully', 'data' => $result['data']], $result['status']);
    }

    public function store(Request $request)
    {
        $result = $this->roles->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'Role created successfully', 'data' => $result['data']], 201);
    }

    public function show(string $id)
    {
        $result = $this->roles->getById((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Role retrieved successfully', 'data' => $result['data']], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->roles->update((int) $id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Role updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->roles->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => $result['message']], 200);
    }
}
