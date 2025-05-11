<?php

namespace Sawmainek\Apitoolz\Services;

use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Sawmainek\Apitoolz\Mails\PasswordResetMail;
use Sawmainek\Apitoolz\Models\User;

class PasswordResetService
{
    protected $twoFactorAuthService;

    public function __construct(TwoFactorAuthService $twoFactorAuthService)
    {
        $this->twoFactorAuthService = $twoFactorAuthService;
    }
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

    public function sendResetOTP($phone)
    {
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            Log::warning("Password reset requested for non-existent phone: {$phone}");
            return ['message' => 'Phone number not found.', 'status' => 400];
        }

        $this->twoFactorAuthService->sendOTP($user);

        Log::info("Password reset link sent to phone: {$phone}");

        return ['message' => 'Password reset otp sent successfully.', 'status' => 200];
    }

    public function verifyOTP($phone, $otp)
    {
        $user = User::where('phone', $phone)->first();
        if (!$user) {
            Log::warning("Verify otp password reset requested for non-existent phone: {$phone}");
            return ['message' => 'Phone number not found.', 'status' => 400];
        }

        if ($this->twoFactorAuthService->verifyOTP($user, $otp)) {
            $token = Password::getRepository()->create($user);
            return ['message' => 'OTP verified successfully', 'token' => $token, 'status' => 200];
        }

        return ['message' => 'Invalid OTP for password reset.', 'status' => 400];
    }

    public function resetPassword($data)
    {
        $response = Password::reset($data, function ($user, $password) {
            $user->password = bcrypt($password);
            $user->save();
        });

        if ($response == Password::PASSWORD_RESET) {
            if (isset($data['email'])) {
                Log::info("Password successfully reset for email: {$data['email']}");
            } elseif (isset($data['phone'])) {
                Log::info("Password successfully reset for phone: {$data['phone']}");
            }
            return ['message' => 'Password reset successful.', 'status' => 200];
        } else {
            if (isset($data['email'])) {
                Log::error("Password reset failed for email: {$data['email']}");
            } elseif (isset($data['phone'])) {
                Log::error("Password reset failed for phone: {$data['phone']}");
            }
            return ['message' => 'Invalid or expired reset token.', 'status' => 400];
        }

    }
}
