<?php

namespace App\Services;

use App\Repositories\Contracts\UserBanRepository;
use Illuminate\Support\Facades\Validator;

class UserBanService
{
    protected UserBanRepository $bans;

    public function __construct(UserBanRepository $bans)
    {
        $this->bans = $bans;
    }

    public function getAll()
    {
        return ['data' => $this->bans->allWithUser(), 'status' => 200];
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'user_id' => 'required|exists:users,id',
            'ban_duration' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $ban = $this->bans->create([
            'user_id' => $data['user_id'],
            'ban_duration' => $data['ban_duration']
        ]);

        return ['data' => $ban, 'status' => 201];
    }

    public function getByUserId(int $userId, string $userTimeZone)
    {
        $now = now()->timezone($userTimeZone)->toDateTimeString();
        $banInfo = $this->bans->findByUserId($userId);

        if ($banInfo) {
            $banEndTime = $banInfo->created_at
                ->addHours($banInfo->ban_duration)
                ->timezone($userTimeZone)->toDateTimeString();

            if ($now < $banEndTime) {
                return ['data' => $banInfo, 'status' => 200, 'active' => true];
            }
        }

        return ['message' => 'No active ban found for this user', 'expired' => $banInfo, 'status' => 200, 'active' => false];
    }

    public function update(int $id, array $data)
    {
        $validator = Validator::make($data, [
            'ban_duration' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $ban = $this->bans->update($id, ['ban_duration' => $data['ban_duration']]);

        if (!$ban) {
            return ['message' => 'Ban record not found', 'status' => 404];
        }

        return ['data' => $ban, 'status' => 200];
    }

    public function delete(int $id)
    {
        $deleted = $this->bans->delete($id);

        if (!$deleted) {
            return ['message' => 'Ban record not found', 'status' => 404];
        }

        return ['message' => 'Ban record deleted successfully', 'status' => 200];
    }
}
