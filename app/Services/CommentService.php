<?php

namespace App\Services;

use App\Models\Report;
use App\Repositories\Contracts\CommentRepository;
use Illuminate\Support\Facades\Validator;

class CommentService
{
    protected CommentRepository $comments;

    public function __construct(CommentRepository $comments)
    {
        $this->comments = $comments;
    }

    public function getAll()
    {
        return $this->comments->all();
    }

    public function getById(string $id)
    {
        return $this->comments->find($id);
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'book_id' => 'required|exists:books,id',
            'content' => 'required|string|min:1',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors()];
        }

        $data['user_id'] = auth()->id();
        return $this->comments->create($data);
    }

    public function update(string $id, array $data)
    {
        $comment = $this->comments->find($id);

        if (!$comment) {
            return null;
        }

        $validator = Validator::make($data, [
            'content' => 'required|string|min:1',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors()];
        }

        return $this->comments->update($comment, ['content' => $data['content']]);
    }

    public function delete(string $id)
    {
        $comment = $this->comments->find($id);
        if (!$comment) {
            return null;
        }
        $this->comments->delete($comment);
        return true;
    }

    public function checkReport(string $id)
    {
        return Report::where('comment_id', $id)->exists();
    }
}
