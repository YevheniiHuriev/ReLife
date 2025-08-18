<?php

namespace App\Services;

use App\Repositories\Contracts\AuthorRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthorService
{
    protected AuthorRepository $authors;

    public function __construct(AuthorRepository $authors)
    {
        $this->authors = $authors;
    }

    public function getAll()
    {
        return $this->authors->all();
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|unique:authors,name',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $author = $this->authors->create(['name' => $data['name']]);
        return ['data' => $author, 'status' => 201];
    }

    public function getById(int $id)
    {
        $author = $this->authors->findWithBooks($id);

        if (!$author) {
            return ['message' => 'Author not found', 'status' => 404];
        }

        return ['data' => $author, 'status' => 200];
    }

    public function update(int $id, array $data)
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|unique:authors,name,' . $id,
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        $author = $this->authors->update($id, ['name' => $data['name']]);

        if (!$author) {
            return ['message' => 'Author not found', 'status' => 404];
        }

        return ['data' => $author, 'status' => 200];
    }

    public function delete(int $id)
    {
        DB::beginTransaction();

        try {
            $deleted = $this->authors->delete($id);

            if (!$deleted) {
                DB::rollBack();
                return ['message' => 'Author not found', 'status' => 404];
            }

            DB::commit();
            return ['message' => 'Author deleted successfully', 'status' => 200];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['message' => 'Failed to delete author', 'error' => $e->getMessage(), 'status' => 500];
        }
    }
}
