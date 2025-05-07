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

    public function resetPassword($data)
    {
        if(isset($data['phone'])) {
            $user = User::where('phone', $data['phone'])->first();
            if (!$user) {
                Log::warning("Password reset requested for non-existent phone: {$data['phone']}");
                return ['message' => 'Phone number not found.', 'status' => 400];
            }

            $isValidOTP = $this->twoFactorAuthService->verifyOTP($user, $data['otp']);
            if (!$isValidOTP) {
                Log::error("Invalid OTP provided for phone: {$data['phone']}");
                return ['message' => 'Invalid or expired OTP.', 'status' => 400];
            }

            $user->password = bcrypt($data['password']);
            $user->save();

            Log::info("Password successfully reset for phone: {$data['phone']}");

            return ['message' => 'Password reset successful.', 'status' => 200];
        } else {
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
}
