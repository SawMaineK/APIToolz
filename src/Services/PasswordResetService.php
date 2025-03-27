<?php

namespace Sawmainek\Apitoolz\Services;

use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Sawmainek\Apitoolz\Mails\PasswordResetMail;
use Sawmainek\Apitoolz\Models\User;

class PasswordResetService
{
    public function sendResetLink($email)
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            Log::warning("Password reset requested for non-existent email: {$email}");
            return ['message' => 'Email not found.', 'status' => 400];
        }

        $token = Password::getRepository()->create($user);

        // Send Email
        Mail::to($user->email)->send(new PasswordResetMail($user, $token));

        // Send SMS (if required)
        // $this->sendResetSMS($user->phone, $token);

        Log::info("Password reset link sent to email: {$email}");

        return ['message' => 'Password reset link sent successfully.', 'status' => 200];
    }

    public function resetPassword($data)
    {
        $response = Password::reset($data, function ($user, $password) {
            $user->password = bcrypt($password);
            $user->save();
        });

        if ($response == Password::PASSWORD_RESET) {
            Log::info("Password successfully reset for email: {$data['email']}");
            return ['message' => 'Password reset successful.', 'status' => 200];
        } else {
            Log::error("Password reset failed for email: {$data['email']}");
            return ['message' => 'Invalid or expired reset token.', 'status' => 400];
        }
    }
}
