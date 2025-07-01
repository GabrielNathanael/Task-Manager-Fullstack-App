<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'due_date',
        'user_id', 
        'project_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Tambahkan relasi project
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}