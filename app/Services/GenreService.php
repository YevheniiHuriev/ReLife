<?php

namespace App\Services;

use App\Repositories\Contracts\GenreRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class GenreService
{
    protected $genres;

    public function __construct(GenreRepository $genres)
    {
        $this->genres = $genres;
    }

    public function getAll()
    {
        return $this->genres->all();
    }

    public function findById(string $id)
    {
        return $this->genres->find($id);
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|unique:genres,name',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $genre = $this->genres->create(['name' => $data['name']]);
        return ['data' => $genre, 'status' => 201];
    }

    public function update(string $id, array $data)
    {
        $genre = $this->genres->find($id);
        if (!$genre) {
            return ['message' => 'Genre not found', 'status' => 404];
        }

        $validator = Validator::make($data, [
            'name' => 'required|string|unique:genres,name,' . $id,
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $updated = $this->genres->update($genre, ['name' => $data['name']]);
        return ['data' => $updated, 'status' => 200];
    }

    public function delete(string $id)
    {
        $genre = $this->genres->find($id);
        if (!$genre) {
            return ['message' => 'Genre not found', 'status' => 404];
        }

        DB::beginTransaction();
        try {
            $this->genres->delete($genre);
            DB::commit();
            return ['message' => 'Genre deleted successfully', 'status' => 200];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'message' => 'Failed to delete genre',
                'error'   => $e->getMessage(),
                'status'  => 500
            ];
        }
    }
}
