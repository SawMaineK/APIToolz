<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Sawmainek\Apitoolz\Http\Requests\Verify2FARequest;
use Sawmainek\Apitoolz\Services\AuthService;
use Sawmainek\Apitoolz\Services\TwoFactorAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenApi\Annotations as OA;

class TwoFactorAuthController extends APIToolzController
{
    protected $authService;
    protected $twoFactorAuthService;

    public function __construct(AuthService $authService, TwoFactorAuthService $twoFactorAuthService)
    {
        $this->authService = $authService;
        $this->twoFactorAuthService = $twoFactorAuthService;
    }

    /**
     * @OA\Post(
     *     path="/api/verify-2fa",
     *     summary="Verify 2FA OTP",
     *     tags={"Two-Factor Authentication"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/Verify2FARequest")
     *     ),
     *     @OA\Response(response=200, description="2FA Verified Successfully", @OA\JsonContent()),
     *     @OA\Response(response=400, description="Invalid OTP"),
     *     @OA\Response(response=500, description="Server Error")
     * )
     */
    public function verify2FA(Verify2FARequest $request)
    {
        Log::info("Processing 2FA verification request for email: " . $request->email);
        try {
            $user = $this->authService->findByEmail($request->email);

            if (!$user || !$user->is_2fa_enabled) {
                Log::warning("Invalid 2FA verification attempt for email: " . $request->email);
                return $this->response(['message' => 'Invalid request'], 400);
            }

            if (!$this->twoFactorAuthService->verifyOTP($user, $request->otp)) {
                Log::warning("Invalid OTP provided for email: " . $request->email);
                return $this->response(['message' => 'Invalid OTP'], 400);
            }

            Log::info("2FA verified successfully for email: " . $request->email);
            return $this->response(['message' => '2FA verified successfully', 'data' => $this->authService->generateAuthToken($user)]);
        } catch (\Exception $e) {
            Log::error("2FA verification error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred during 2FA verification.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/resend-2fa",
     *     summary="Resend 2FA OTP",
     *     tags={"Two-Factor Authentication"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email"},
     *              @OA\Property(property="email", type="string", format="email", example="user@example.com")
     *          )
     *     ),
     *     @OA\Response(response=200, description="OTP resent successfully", @OA\JsonContent()),
     *     @OA\Response(response=400, description="Invalid request"),
     *     @OA\Response(response=500, description="Server Error")
     * )
     */
    public function resend2FA(Request $request)
    {
        Log::info("Resend 2FA request received.", ['email' => $request->email]);

        try {
            // Find user by email
            $user = $this->authService->findByEmail($request->email);

            if (!$user || !$user->is_2fa_enabled) {
                Log::warning("Resend 2FA failed: User not found or 2FA not enabled.", ['email' => $request->email]);
                return $this->response(['message' => 'Invalid request'], 400);
            }

            // Resend OTP
            $otpResponse = $this->twoFactorAuthService->sendOTP($user);

            // If sendOTP() returns an error response, return it immediately
            if ($otpResponse->getStatusCode() !== 200) {
                return $otpResponse;
            }

            Log::info("2FA OTP resent successfully.", ['user_id' => $user->id]);

            return $this->response([
                'message' => '2FA OTP resent successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Resend 2FA error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred while resending OTP.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/enable-2fa",
     *     summary="Enable Two-Factor Authentication",
     *     tags={"Two-Factor Authentication"},
     *     security={{"apiAuth":{}}},
     *     @OA\Response(response=200, description="2FA Enabled Successfully", @OA\JsonContent()),
     *     @OA\Response(response=400, description="2FA Already Enabled"),
     *     @OA\Response(response=500, description="Server Error")
     * )
     */
    public function enable2FA(Request $request)
    {
        try {
            $user = auth()->user();

            Log::info("User {$user->id} is attempting to enable 2FA.");

            if ($user->is_2fa_enabled) {
                Log::warning("User {$user->id} attempted to enable 2FA, but it is already enabled.");
                return $this->response(['message' => '2FA is already enabled.'], 400);
            }

            $this->twoFactorAuthService->enable2FA($user);

            Log::info("2FA successfully enabled for user ID: {$user->id}.");
            return $this->response(['message' => '2FA enabled successfully']);
        } catch (\Exception $e) {
            Log::error("Error enabling 2FA for user ID: {$user->id}. Error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred while enabling 2FA.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/disable-2fa",
     *     summary="Disable Two-Factor Authentication",
     *     tags={"Two-Factor Authentication"},
     *     security={{"apiAuth":{}}},
     *     @OA\Response(response=200, description="2FA Disabled Successfully", @OA\JsonContent()),
     *     @OA\Response(response=400, description="2FA Already Disabled"),
     *     @OA\Response(response=500, description="Server Error")
     * )
     */
    public function disable2FA(Request $request)
    {
        try {
            $user = auth()->user();

            Log::info("User {$user->id} is attempting to disable 2FA.");

            if (!$user->is_2fa_enabled) {
                Log::warning("User {$user->id} attempted to disable 2FA, but it is already disabled.");
                return $this->response(['message' => '2FA is already disabled.'], 400);
            }

            $this->twoFactorAuthService->disable2FA($user);

            Log::info("2FA successfully disabled for user ID: {$user->id}.");
            return $this->response(['message' => '2FA disabled successfully']);
        } catch (\Exception $e) {
            Log::error("Error disabling 2FA for user ID: {$user->id}. Error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred while disabling 2FA.'], 500);
        }
    }
}
