<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class UserService
{
    protected UserRepository $users;

    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    public function getAll()
    {
        return $this->users->allWithRole();
    }

    public function create(array $data, $photoFile = null)
    {
        $validator = Validator::make($data, [
            'username'   => 'required|string|unique:users,username',
            'email'      => 'required|string|email|unique:users,email',
            'password'   => 'required|string|confirmed',
            'photo'      => 'nullable',
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'birthdate'  => 'required|date',
            'phone'      => 'required|string',
            'address'    => 'required|string',
            'role_id'    => 'nullable|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        if ($photoFile) {
            $hash = md5_file($photoFile->getRealPath());
            $pathForDb = "storage/photos/{$hash}.jpg";
            $diskPath  = "public/photos/{$hash}.jpg";

            $existsInDb = User::where('photo', $pathForDb)->exists();
            if (!$existsInDb && !Storage::exists($diskPath)) {
                $photoFile->storeAs('public/photos', "{$hash}.jpg");
            }

            $data['photo'] = $pathForDb;
        }

        $data['password'] = Hash::make($data['password']);

        $user = $this->users->create($data);
        return ['data' => $user, 'status' => 201];
    }

    public function getById(int $id)
    {
        $user = $this->users->findByIdWithRole($id);

        if (!$user) {
            return ['message' => 'User not found', 'status' => 404];
        }

        return ['data' => $user, 'status' => 200];
    }

    public function update(int $id, array $data, $photoFile = null)
    {
        $validator = Validator::make($data, [
            'username'   => 'sometimes|required|string|unique:users,username,' . $id,
            'email'      => 'sometimes|required|string|email|unique:users,email,' . $id,
            'password'   => 'sometimes|required|string|confirmed',
            'photo'      => 'sometimes|nullable',
            'first_name' => 'sometimes|required|string',
            'last_name'  => 'sometimes|required|string',
            'birthdate'  => 'sometimes|required|date',
            'phone'      => 'sometimes|required|string',
            'address'    => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $user = $this->users->findById($id);
        if (!$user) {
            return ['message' => 'User not found', 'status' => 404];
        }

        $oldPhotoPath = $user->photo;

        if ($photoFile) {
            $hash = md5_file($photoFile->getRealPath());
            $pathForDb = "storage/photos/{$hash}.jpg";
            $diskPath  = "public/photos/{$hash}.jpg";

            $existsInDb = User::where('photo', $pathForDb)->exists();
            if (!$existsInDb && !Storage::exists($diskPath)) {
                $photoFile->storeAs('public/photos', "{$hash}.jpg");
            }

            $data['photo'] = $pathForDb;
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $updated = $this->users->update($id, $data);

        if (!$updated) {
            return ['message' => 'User not found', 'status' => 404];
        }

        if (!empty($oldPhotoPath) && $oldPhotoPath !== ($data['photo'] ?? $oldPhotoPath)) {
            $stillUsed = User::where('photo', $oldPhotoPath)->exists();
            if (!$stillUsed) {
                // $oldPhotoPath stored as "storage/photos/{hash}.jpg"
                $basename = basename($oldPhotoPath);
                Storage::delete("public/photos/{$basename}");
            }
        }

        return ['data' => $updated, 'status' => 200];
    }

    public function adminUpdate(int $id, array $data, $photoFile = null)
    {
        $validator = Validator::make($data, [
            'username'   => 'sometimes|required|string|unique:users,username,' . $id,
            'email'      => 'sometimes|required|string|email|unique:users,email,' . $id,
            'password'   => 'sometimes|required|string|confirmed',
            'photo'      => 'sometimes|nullable',
            'first_name' => 'sometimes|required|string',
            'last_name'  => 'sometimes|required|string',
            'birthdate'  => 'sometimes|required|date',
            'phone'      => 'sometimes|required|string',
            'address'    => 'sometimes|required|string',
            'role_id'    => 'sometimes|nullable|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        return $this->update($id, $data, $photoFile);
    }

    public function delete(int $id)
    {
        $user = $this->users->findById($id);
        if (!$user) {
            return ['message' => 'User not found', 'status' => 404];
        }

        DB::beginTransaction();
        try {
            $photoPath = $user->photo;

            $deleted = $this->users->delete($id);
            if (!$deleted) {
                DB::rollBack();
                return ['message' => 'User not found', 'status' => 404];
            }

            if ($photoPath) {
                $stillUsed = User::where('photo', $photoPath)->exists();
                if (!$stillUsed) {
                    $basename = basename($photoPath);
                    Storage::delete("public/photos/{$basename}");
                }
            }

            DB::commit();
            return ['message' => 'User deleted successfully', 'status' => 200];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['message' => 'Failed to delete user', 'error' => $e->getMessage(), 'status' => 500];
        }
    }

    public function getSystemBotId()
    {
        $id = $this->users->findFirstIdByRoleName('administration');

        if (!$id) {
            return ['message' => 'No bot user found.', 'status' => 404];
        }

        return ['bot_id' => $id, 'status' => 200];
    }
}
