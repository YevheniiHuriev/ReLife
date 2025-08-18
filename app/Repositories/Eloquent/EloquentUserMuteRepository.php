<?php

namespace App\Repositories\Eloquent;

use App\Models\UserMute;
use App\Repositories\Contracts\UserMuteRepository;

class EloquentUserMuteRepository implements UserMuteRepository
{
    public function allForUser(int $userId)
    {
        return UserMute::with('user')->where('user_id', $userId)->get();
    }

    public function create(array $data): UserMute
    {
        return UserMute::create($data);
    }

    public function findById(int $id): ?UserMute
    {
        return UserMute::find($id);
    }

    public function findByUserId(int $userId): ?UserMute
    {
        return UserMute::where('user_id', $userId)->first();
    }

    public function update(int $id, array $data): ?UserMute
    {
        $mute = UserMute::find($id);
        if (!$mute) return null;

        $mute->update($data);
        return $mute;
    }

    public function delete(int $id): bool
    {
        $mute = UserMute::find($id);
        if (!$mute) return false;

        return $mute->delete();
    }
}
