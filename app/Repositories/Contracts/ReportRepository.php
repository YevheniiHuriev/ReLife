<?php

namespace App\Repositories\Contracts;

use App\Models\Report;

interface ReportRepository
{
    public function allWithRelations();
    public function create(array $data): Report;
    public function findByIdWithRelations(int $id): ?Report;
    public function findById(int $id): ?Report;
    public function update(int $id, array $data): ?Report;
    public function delete(int $id): bool;
}
