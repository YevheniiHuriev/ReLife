<?php

namespace App\Services;

use App\Repositories\Contracts\UserMuteRepository;
use Illuminate\Support\Facades\Validator;

class UserMuteService
{
    protected UserMuteRepository $mutes;

    public function __construct(UserMuteRepository $mutes)
    {
        $this->mutes = $mutes;
    }

    public function getAllForUser(int $userId)
    {
        return $this->mutes->allForUser($userId);
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'user_id' => 'required|exists:users,id',
            'mute_duration' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $mute = $this->mutes->create($data);
        return ['data' => $mute, 'status' => 201];
    }

    public function getByUserId(int $userId, string $timezone)
    {
        $now = now()->timezone($timezone)->toDateTimeString();
        $mute = $this->mutes->findByUserId($userId);

        if ($mute) {
            $muteEndTime = $mute->created_at
                ->addHours($mute->mute_duration)
                ->timezone($timezone)->toDateTimeString();

            if ($now < $muteEndTime) {
                return ['data' => $mute, 'status' => 200];
            }
        }

        return ['message' => 'No active mute found for this user', 'expired' => $mute, 'status' => 200];
    }

    public function update(int $id, array $data)
    {
        $validator = Validator::make($data, [
            'mute_duration' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $mute = $this->mutes->update($id, $data);
        if (!$mute) {
            return ['message' => 'Mute record not found', 'status' => 404];
        }

        return ['data' => $mute, 'status' => 200];
    }

    public function delete(int $id)
    {
        $deleted = $this->mutes->delete($id);
        if (!$deleted) {
            return ['message' => 'Mute record not found', 'status' => 404];
        }

        return ['message' => 'Mute record deleted successfully', 'status' => 200];
    }
}
