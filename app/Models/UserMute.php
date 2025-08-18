<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMute extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'mute_duration'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function findActiveMuteByUserId($userId)
    {
        return self::where('user_id', $userId)
            ->whereRaw('NOW() < DATE_ADD(created_at, INTERVAL mute_duration HOUR)')
            ->first();
    }
}
