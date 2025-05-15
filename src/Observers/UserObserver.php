<?php

namespace App\Observers;

use App\Jobs\NotifyUserUpdateJob;
use Sawmainek\Apitoolz\Models\User;
use Illuminate\Support\Facades\Log;
class UserObserver
{
    public function creating(User $user)
    {
        Log::info('Before creating user', ['data' => $user->toArray()]);
    }

    public function created(User $user)
    {
        Log::info('After creating user', ['id' => $user->id]);
        dispatch(new NotifyUserUpdateJob($user)); // async
    }

    public function updating(User $user)
    {
        Log::info('Before updating user', ['id' => $user->id]);
    }

    public function updated(User $user)
    {
        Log::info('After updating user', ['id' => $user->id]);
    }

    public function deleting(User $user)
    {
        Log::info('Before deleting user', ['id' => $user->id]);
    }

    public function deleted(User $user)
    {
        Log::info('After deleting user', ['id' => $user->id]);
    }

    public function restoring(User $user)
    {
        Log::info('Before restoring user', ['id' => $user->id]);
    }

    public function restored(User $user)
    {
        Log::info('After restoring user', ['id' => $user->id]);
    }
}
