<?php

namespace App\Services;

use App\Repositories\Contracts\ReportRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReportService
{
    protected ReportRepository $reports;

    public function __construct(ReportRepository $reports)
    {
        $this->reports = $reports;
    }

    public function getAll()
    {
        return ['data' => $this->reports->allWithRelations(), 'status' => 200];
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'comment_id' => 'required|exists:comments,id',
            'reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $user = Auth::user();

        $report = $this->reports->create([
            'comment_id' => $data['comment_id'],
            'reporter_id' => $user->id,
            'reason' => $data['reason'],
            'isChecked' => false,
        ]);

        return ['data' => $report, 'status' => 201];
    }

    public function getById(int $id)
    {
        $report = $this->reports->findByIdWithRelations($id);

        if (!$report) {
            return ['message' => 'Report not found', 'status' => 404];
        }

        return ['data' => $report, 'status' => 200];
    }

    public function update(int $id, array $data)
    {
        $validator = Validator::make($data, [
            'verdict' => 'required'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $report = $this->reports->update($id, [
            'isChecked' => true,
            'verdict' => $data['verdict'],
        ]);

        if (!$report) {
            return ['message' => 'Report not found', 'status' => 404];
        }

        return ['data' => $report, 'status' => 200];
    }

    public function delete(int $id)
    {
        $deleted = $this->reports->delete($id);

        if (!$deleted) {
            return ['message' => 'Report not found', 'status' => 404];
        }

        return ['message' => 'Report removed successfully', 'status' => 200];
    }
}
