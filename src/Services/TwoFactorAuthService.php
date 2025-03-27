<?php

namespace Sawmainek\Apitoolz\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TwoFactorAuthService
{
    public function sendOTP($user)
    {
        $otpCacheKey = '2fa_otp_' . $user->id;
        $otpTimestampKey = '2fa_otp_timestamp_' . $user->id;
        $resendCountKey = '2fa_resend_count_' . $user->id;

        // Check if an OTP was already sent within the last 1 minute
        if (Cache::has($otpCacheKey) && Cache::has($otpTimestampKey)) {
            $lastSentTime = Cache::get($otpTimestampKey);
            if (now()->diffInSeconds($lastSentTime) < 60) {
                Log::warning("OTP was already sent recently for user ID: {$user->id}");
                return response()->json([
                    'message' => 'OTP has already been sent. Please wait before requesting again.'
                ], 200);
            }
        }

        // Check rate limit: Max 3 resends per minute
        if (Cache::has($resendCountKey) && Cache::get($resendCountKey) >= 3) {
            Log::warning("2FA resend rate limit reached for user ID: {$user->id}");
            return response()->json([
                'message' => 'Too many OTP requests. Please try again later.'
            ], 429);
        }

        // Generate new OTP
        $otp = rand(100000, 999999);
        Cache::put($otpCacheKey, $otp, now()->addMinutes(10)); // Store OTP for 10 minutes
        Cache::put($otpTimestampKey, now(), now()->addMinutes(10)); // Track OTP creation time

        // Track resend count (expire after 1 minute)
        Cache::increment($resendCountKey);
        Cache::put($resendCountKey, Cache::get($resendCountKey, 0), now()->addMinutes(1));

        // Send OTP via email (or SMS if needed)
        Mail::raw("Your 2FA OTP code is: $otp", function ($message) use ($user) {
            $message->to($user->email)->subject('Your 2FA Code');
        });

        Log::info("2FA OTP sent to user ID: {$user->id}");

        return response()->json([
            'message' => 'OTP has been sent successfully.'
        ], 200);
    }


    public function verifyOTP($user, $otp)
    {
        $cachedOtp = Cache::get('2fa_otp_' . $user->id);

        if ($cachedOtp && $cachedOtp == $otp) {
            Cache::forget('2fa_otp_' . $user->id);
            return true;
        }

        return false;
    }

    public function enable2FA($user)
    {
        try {
            Log::info("Processing 2FA enable request for user ID: {$user->id}.");

            if ($user->is_2fa_enabled) {
                Log::warning("User ID: {$user->id} tried to enable 2FA, but it's already enabled.");
                throw new \Exception("2FA is already enabled.");
            }

            $user->is_2fa_enabled = true;
            $user->save();

            Log::info("2FA successfully enabled for user ID: {$user->id}. Sending OTP...");

            // Generate and send an OTP upon enabling 2FA
            $this->sendOTP($user);

            Log::info("OTP sent to user ID: {$user->id} after enabling 2FA.");
        } catch (\Exception $e) {
            Log::error("Failed to enable 2FA for user ID: {$user->id}. Error: " . $e->getMessage());
            throw $e;
        }
    }

    public function disable2FA($user)
    {
        try {
            Log::info("Processing 2FA disable request for user ID: {$user->id}.");

            if (!$user->is_2fa_enabled) {
                Log::warning("User ID: {$user->id} tried to disable 2FA, but it's already disabled.");
                throw new \Exception("2FA is already disabled.");
            }

            $user->is_2fa_enabled = false;
            $user->save();

            // Remove any stored OTPs when disabling 2FA
            Cache::forget('2fa_otp_' . $user->id);

            Log::info("2FA successfully disabled for user ID: {$user->id}. Cleared any stored OTPs.");
        } catch (\Exception $e) {
            Log::error("Failed to disable 2FA for user ID: {$user->id}. Error: " . $e->getMessage());
            throw $e;
        }
    }

}
