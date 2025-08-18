<?php

namespace App\Repositories\Eloquent;

use App\Models\UserBan;
use App\Repositories\Contracts\UserBanRepository;

class EloquentUserBanRepository implements UserBanRepository
{
    public function allWithUser()
    {
        return UserBan::with('user')->get();
    }

    public function create(array $data): UserBan
    {
        return UserBan::create($data);
    }

    public function findById(int $id): ?UserBan
    {
        return UserBan::find($id);
    }

    public function findByUserId(int $userId): ?UserBan
    {
        return UserBan::where('user_id', $userId)->first();
    }

    public function update(int $id, array $data): ?UserBan
    {
        $ban = UserBan::find($id);
        if (!$ban) return null;

        $ban->update($data);
        return $ban;
    }

    public function delete(int $id): bool
    {
        $ban = UserBan::find($id);
        if (!$ban) return false;

        return $ban->delete();
    }
}
