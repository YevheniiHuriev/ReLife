<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookDetails extends Model
{
    use HasFactory;

    protected $fillable = ['book_id', 'detail_id', 'type'];

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function detail()
    {
        if ($this->type === 'author') {
            return $this->belongsTo(Author::class, 'detail_id');
        } elseif ($this->type === 'genre') {
            return $this->belongsTo(Genre::class, 'detail_id');
        }
    }
}
