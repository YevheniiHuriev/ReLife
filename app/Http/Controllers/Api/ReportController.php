<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ReportService;

class ReportController extends Controller
{
    protected ReportService $reports;

    public function __construct(ReportService $reports)
    {
        $this->reports = $reports;
    }

    public function index()
    {
        $result = $this->reports->getAll();
        return response()->json(['success' => true, 'message' => 'Reports retrieved successfully', 'data' => $result['data']], $result['status']);
    }

    public function store(Request $request)
    {
        $result = $this->reports->create($request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        return response()->json(['success' => true, 'message' => 'Report created successfully', 'data' => $result['data']], 201);
    }

    public function show(string $id)
    {
        $result = $this->reports->getById((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Report retrieved successfully', 'data' => $result['data']], 200);
    }

    public function update(Request $request, string $id)
    {
        $result = $this->reports->update((int) $id, $request->all());

        if (isset($result['errors'])) {
            return response()->json(['success' => false, 'errors' => $result['errors']], 422);
        }

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => 'Report updated successfully', 'data' => $result['data']], 200);
    }

    public function destroy(string $id)
    {
        $result = $this->reports->delete((int) $id);

        if ($result['status'] !== 200) {
            return response()->json(['success' => false, 'message' => $result['message']], $result['status']);
        }

        return response()->json(['success' => true, 'message' => $result['message']], 200);
    }
}
