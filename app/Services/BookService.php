<?php

namespace App\Services;

use App\Repositories\Contracts\BookRepository;
use App\Models\Author;
use App\Models\Genre;
use App\Models\Book;
use App\Models\BookDetails;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BookService
{
    protected BookRepository $books;

    public function __construct(BookRepository $books)
    {
        $this->books = $books;
    }

    public function getAll()
    {
        return $this->books->allWithRelations();
    }

    public function create(array $data)
    {
        $validator = Validator::make($data, [
            'title' => 'required|string',
            'description' => 'required|string',
            'cover_image' => 'required|file|mimes:jpeg,jpg,png',
            'content' => 'required|file|mimes:pdf',
            'demo' => 'required|file|mimes:pdf',
            'year' => 'required|integer',
            'pages' => 'required|integer',
            'price' => 'required|numeric',
            'authors' => 'required|array',
            'genres' => 'required|array',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        DB::beginTransaction();
        try {
            $coverHash = md5_file($data['cover_image']->getRealPath());
            $contentHash = md5_file($data['content']->getRealPath());
            $demoHash = md5_file($data['demo']->getRealPath());

            $coverPath = "storage/covers/{$coverHash}.jpg";
            $contentPath = "storage/content/{$contentHash}.pdf";
            $demoPath = "storage/demo/{$demoHash}.pdf";

            if (!Storage::exists("public/covers/{$coverHash}.jpg")) {
                $data['cover_image']->storeAs('public/covers', "{$coverHash}.jpg");
            }
            if (!Storage::exists("public/content/{$contentHash}.pdf")) {
                $data['content']->storeAs('public/content', "{$contentHash}.pdf");
            }
            if (!Storage::exists("public/demo/{$demoHash}.pdf")) {
                $data['demo']->storeAs('public/demo', "{$demoHash}.pdf");
            }

            $book = $this->books->create([
                'title' => $data['title'],
                'description' => $data['description'],
                'cover_image' => $coverPath,
                'content' => $contentPath,
                'demo' => $demoPath,
                'year' => $data['year'],
                'pages' => $data['pages'],
                'price' => $data['price'],
            ]);

            foreach ($data['authors'] as $authorName) {
                $author = Author::firstOrCreate(['name' => $authorName]);
                BookDetails::create([
                    'book_id' => $book->id,
                    'detail_id' => $author->id,
                    'type' => 'author',
                ]);
            }

            foreach ($data['genres'] as $genreName) {
                $genre = Genre::firstOrCreate(['name' => $genreName]);
                BookDetails::create([
                    'book_id' => $book->id,
                    'detail_id' => $genre->id,
                    'type' => 'genre',
                ]);
            }

            DB::commit();
            return ['data' => $book, 'status' => 201];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['message' => 'Failed to add book', 'error' => $e->getMessage(), 'status' => 500];
        }
    }

    public function getById(int $id)
    {
        $book = $this->books->findWithRelations($id);
        if (!$book) {
            return ['message' => 'Book not found', 'status' => 404];
        }
        return ['data' => $book, 'status' => 200];
    }

    public function update(int $id, array $data)
    {
        $book = $this->books->findById($id);
        if (!$book) {
            return ['message' => 'Book not found', 'status' => 404];
        }

        $validator = Validator::make($data, [
            'title' => 'sometimes|required|string',
            'description' => 'sometimes|required|string',
            'cover_image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'content' => 'sometimes|mimes:pdf|max:10240',
            'demo' => 'sometimes|mimes:pdf|max:10240',
            'year' => 'sometimes|required|integer|digits:4',
            'pages' => 'sometimes|required|integer',
            'price' => 'sometimes|required|numeric|min:0',
            'authors' => 'sometimes|array',
            'genres' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors(), 'status' => 422];
        }

        DB::beginTransaction();
        try {
            $oldCoverPath = $book->cover_image;
            $oldContentPath = $book->content;
            $oldDemoPath = $book->demo;

            if (isset($data['title'])) $book->title = $data['title'];
            if (isset($data['description'])) $book->description = $data['description'];

            if (isset($data['cover_image'])) {
                $coverHash = md5_file($data['cover_image']->getRealPath());
                $coverPath = "storage/covers/{$coverHash}.jpg";
                if (!Storage::exists("public/covers/{$coverHash}.jpg")) {
                    $data['cover_image']->storeAs('public/covers', "{$coverHash}.jpg");
                }
                $book->cover_image = $coverPath;
            }

            if (isset($data['content'])) {
                $contentHash = md5_file($data['content']->getRealPath());
                $contentPath = "storage/content/{$contentHash}.pdf";
                if (!Storage::exists("public/content/{$contentHash}.pdf")) {
                    $data['content']->storeAs('public/content', "{$contentHash}.pdf");
                }
                $book->content = $contentPath;
            }

            if (isset($data['demo'])) {
                $demoHash = md5_file($data['demo']->getRealPath());
                $demoPath = "storage/demo/{$demoHash}.pdf";
                if (!Storage::exists("public/demo/{$demoHash}.pdf")) {
                    $data['demo']->storeAs('public/demo', "{$demoHash}.pdf");
                }
                $book->demo = $demoPath;
            }

            if (isset($data['year'])) $book->year = $data['year'];
            if (isset($data['pages'])) $book->pages = $data['pages'];
            if (isset($data['price'])) $book->price = $data['price'];

            $oldAuthorIds = BookDetails::where('book_id', $book->id)->where('type', 'author')->pluck('detail_id')->toArray();
            if (isset($data['authors'])) {
                BookDetails::where('book_id', $book->id)->where('type', 'author')->delete();
                foreach ($data['authors'] as $authorName) {
                    $author = Author::firstOrCreate(['name' => $authorName]);
                    BookDetails::create([
                        'book_id' => $book->id,
                        'detail_id' => $author->id,
                        'type' => 'author',
                    ]);
                }
            }

            $oldGenreIds = BookDetails::where('book_id', $book->id)->where('type', 'genre')->pluck('detail_id')->toArray();
            if (isset($data['genres'])) {
                BookDetails::where('book_id', $book->id)->where('type', 'genre')->delete();
                foreach ($data['genres'] as $genreName) {
                    $genre = Genre::firstOrCreate(['name' => $genreName]);
                    BookDetails::create([
                        'book_id' => $book->id,
                        'detail_id' => $genre->id,
                        'type' => 'genre',
                    ]);
                }
            }

            $book->save();

            foreach ($oldAuthorIds as $authorId) {
                if (BookDetails::where('detail_id', $authorId)->where('type', 'author')->count() === 0) {
                    Author::where('id', $authorId)->delete();
                }
            }

            foreach ($oldGenreIds as $genreId) {
                if (BookDetails::where('detail_id', $genreId)->where('type', 'genre')->count() === 0) {
                    Genre::where('id', $genreId)->delete();
                }
            }

            if ($oldCoverPath && $oldCoverPath !== $book->cover_image && !Book::where('cover_image', $oldCoverPath)->exists()) {
                Storage::delete("public/" . str_replace('storage/', '', $oldCoverPath));
            }
            if ($oldContentPath && $oldContentPath !== $book->content && !Book::where('content', $oldContentPath)->exists()) {
                Storage::delete("public/" . str_replace('storage/', '', $oldContentPath));
            }
            if ($oldDemoPath && $oldDemoPath !== $book->demo && !Book::where('demo', $oldDemoPath)->exists()) {
                Storage::delete("public/" . str_replace('storage/', '', $oldDemoPath));
            }

            DB::commit();
            return ['data' => $book, 'status' => 200];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['message' => 'Failed to update book', 'error' => $e->getMessage(), 'status' => 500];
        }
    }

    public function delete(int $id)
    {
        $book = $this->books->findById($id);
        if (!$book) {
            return ['message' => 'Book not found', 'status' => 404];
        }

        DB::beginTransaction();
        try {
            $coverPath = $book->cover_image;
            $contentPath = $book->content;
            $demoPath = $book->demo;

            $authorIds = BookDetails::where('book_id', $book->id)->where('type', 'author')->pluck('detail_id')->toArray();
            $genreIds = BookDetails::where('book_id', $book->id)->where('type', 'genre')->pluck('detail_id')->toArray();

            BookDetails::where('book_id', $book->id)->delete();
            $book->delete();

            foreach ($authorIds as $authorId) {
                if (BookDetails::where('detail_id', $authorId)->where('type', 'author')->count() === 0) {
                    Author::where('id', $authorId)->delete();
                }
            }

            foreach ($genreIds as $genreId) {
                if (BookDetails::where('detail_id', $genreId)->where('type', 'genre')->count() === 0) {
                    Genre::where('id', $genreId)->delete();
                }
            }

            if ($coverPath && !Book::where('cover_image', $coverPath)->exists()) {
                Storage::delete("public/" . str_replace('storage/', '', $coverPath));
            }
            if ($contentPath && !Book::where('content', $contentPath)->exists()) {
                Storage::delete("public/" . str_replace('storage/', '', $contentPath));
            }
            if ($demoPath && !Book::where('demo', $demoPath)->exists()) {
                Storage::delete("public/" . str_replace('storage/', '', $demoPath));
            }

            DB::commit();
            return ['message' => 'Book deleted successfully', 'status' => 200];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['message' => 'Failed to delete book', 'error' => $e->getMessage(), 'status' => 500];
        }
    }
}
