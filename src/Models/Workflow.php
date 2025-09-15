<?php

namespace Sawmainek\Apitoolz\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'definition'];
}
