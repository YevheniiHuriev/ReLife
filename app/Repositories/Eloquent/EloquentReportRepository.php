<?php

namespace App\Repositories\Eloquent;

use App\Models\Report;
use App\Repositories\Contracts\ReportRepository;

class EloquentReportRepository implements ReportRepository
{
    public function allWithRelations()
    {
        return Report::with('comment.user', 'user')->get();
    }

    public function create(array $data): Report
    {
        return Report::create($data);
    }

    public function findByIdWithRelations(int $id): ?Report
    {
        return Report::with('comment', 'user')->find($id);
    }

    public function findById(int $id): ?Report
    {
        return Report::find($id);
    }

    public function update(int $id, array $data): ?Report
    {
        $report = Report::find($id);
        if (!$report) return null;

        $report->update($data);
        return $report;
    }

    public function delete(int $id): bool
    {
        $report = Report::find($id);
        if (!$report) return false;

        return $report->delete();
    }
}
