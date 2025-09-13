<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Sawmainek\Apitoolz\Http\Requests\ForgotPasswordRequest;
use Sawmainek\Apitoolz\Http\Requests\Verify2FARequest;
use Sawmainek\Apitoolz\Services\AuthService;
use Sawmainek\Apitoolz\Services\PasswordResetService;
use Sawmainek\Apitoolz\Services\TwoFactorAuthService;
use Sawmainek\Apitoolz\Http\Requests\LoginRequest;
use Sawmainek\Apitoolz\Http\Requests\RegisterRequest;
use Sawmainek\Apitoolz\Http\Requests\ProfileRequest;
use Sawmainek\Apitoolz\Http\Requests\ChangePasswordRequest;
use Sawmainek\Apitoolz\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use OpenApi\Annotations as OA;

class AuthController extends APIToolzController
{
    protected $authService;
    protected $passwordResetService;
    protected $twoFactorAuthService;

    public function __construct(AuthService $authService, PasswordResetService $passwordResetService, TwoFactorAuthService $twoFactorAuthService)
    {
        $this->authService = $authService;
        $this->passwordResetService = $passwordResetService;
        $this->twoFactorAuthService = $twoFactorAuthService;
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login to your account",
     *     tags={"Account"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/LoginRequest")
     *     ),
     *     @OA\Response(response=200, description="Successful login", @OA\JsonContent(ref="#/components/schemas/UserResponse")),
     *     @OA\Response(response=202, description="2FA Required", @OA\JsonContent()),
     *     @OA\Response(response=400, description="Invalid credentials"),
     *     @OA\Response(response=429, description="Too many OTP requests"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function login(LoginRequest $request)
    {
        Log::info("Processing login request.");

        try {
            $user = $this->authService->login($request->only('email', 'phone', 'password'));

            if (!$user) {
                return $this->response(['message' => 'Invalid credentials.'], 400);
            }

            if ($user->is_2fa_enabled) {
                Log::info("2FA required for user: " . $user->email);

                $otpResponse = $this->twoFactorAuthService->sendOTP($user);

                // If the OTP service returns an error response, return it immediately
                if ($otpResponse->getStatusCode() !== 200) {
                    return $otpResponse;
                }

                return $this->response([
                    'message' => '2FA required',
                    'requires_2fa' => true
                ], 202);
            }

            Log::info("Login successful for user: " . $user->email);
            return $this->response(['message' => 'Login successful', 'data' => $user]);
        } catch (\Exception $e) {
            Log::error("Login error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred while logging in.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Register a new user",
     *     tags={"Account"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/RegisterRequest")
     *     ),
     *     @OA\Response(response=201, description="User registered", @OA\JsonContent(ref="#/components/schemas/UserResponse")),
     *     @OA\Response(response=400, description="Invalid data"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function register(RegisterRequest $request)
    {
        Log::info("Processing registration request.");

        try {
            $user = $this->authService->register($request->all(), $request);

            return $this->response([
                'message' => 'User registered successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            Log::error("Registration error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred during registration.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/edit-profile",
     *     summary="Update user profile",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/ProfileRequest")
     *     ),
     *     @OA\Response(response=200, description="Profile updated successfully", @OA\JsonContent(ref="#/components/schemas/UserResponse")),
     *     @OA\Response(response=400, description="Invalid request"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function editProfile(ProfileRequest $request)
    {
        $user = $request->user();

        try {
            Log::info("Profile update request received for user ID: {$user->id}");

            $updatedUser = $this->authService->editProfile($user, $request->all());

            return $this->response([
                'message' => 'Profile updated successfully',
                'data' => $updatedUser
            ]);
        } catch (\Exception $e) {
            Log::error("Error updating profile for user ID: {$user->id}", ['error' => $e->getMessage()]);
            return $this->response(['message' => 'Something went wrong'], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/user",
     *     summary="Get authenticated user",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\Response(response=200, description="Authenticated user details", @OA\JsonContent(ref="#/components/schemas/UserResponse")),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function show(Request $request)
    {
        Log::info("Fetching authenticated user.");

        try {
            $user = $this->authService->getUser($request);

            if ($user) {
                return $this->response([
                    'message' => 'User details fetched successfully',
                    'data' => $user
                ]);
            }

            return $this->response(['message' => 'Invalid user access.'], 400);
        } catch (\Exception $e) {
            Log::error("Error fetching user: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred while fetching user details.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/change-password",
     *     summary="Change user password",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/ChangePasswordRequest")
     *     ),
     *     @OA\Response(response=200, description="Password changed successfully", @OA\JsonContent(
     *         type="object",
     *         @OA\Property(property="message", type="string", example="Password changed successfully")
     *     )),
     *     @OA\Response(response=400, description="Invalid request"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=429, description="Too many requests"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();
        $rateLimitKey = 'change-password:' . $user->id;

        // Check if user exceeded rate limit
        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) { // Allow max 5 attempts per 10 minutes
            Log::warning("Too many password change attempts for user ID: {$user->id}");
            return response()->json([
                'message' => 'Too many requests. Please try again later.'
            ], 429);
        }

        // Increment attempt count
        RateLimiter::hit($rateLimitKey, 600); // Lock for 10 minutes

        Log::info("Received change password request for user ID: {$user->id}");

        try {
            $result = $this->authService->changePassword($user, $request->validated());

            if ($result['success']) {
                Log::info("Password successfully changed for user ID: {$user->id}");

                // Clear rate limit on success
                RateLimiter::clear($rateLimitKey);

                return response()->json(['message' => 'Password changed successfully'], 200);
            } else {
                Log::warning("Failed password change attempt for user ID: {$user->id} - Incorrect current password.");
                return response()->json(['message' => 'Current password is incorrect'], 400);
            }
        } catch (\Exception $e) {
            Log::error("Error changing password for user ID: {$user->id}", ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Something went wrong'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/forgot-password",
     *     summary="Request password reset link via email or phone",
     *     tags={"Account"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/ForgotPasswordRequest")
     *     ),
     *     @OA\Response(response=200, description="Password reset link or OTP sent"),
     *     @OA\Response(response=400, description="Invalid email or phone"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        try {
            $email = $request->input('email');
            $phone = $request->input('phone');

            if ($email) {
                Log::info("Password reset request received for email: {$email}");
                $response = $this->passwordResetService->sendResetLink($email);
            } elseif ($phone) {
                Log::info("Password reset request received for phone: {$phone}");
                $response = $this->passwordResetService->sendResetOTP($phone);
            } else {
                return response()->json(['message' => 'Email or phone is required.'], 400);
            }

            return response()->json(['message' => $response['message']], $response['status']);
        } catch (\Exception $e) {
            Log::error("Error in password reset request", ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Something went wrong while processing your request.'], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/verify-otp",
     *     summary="Verify OTP sent to phone",
     *     tags={"Account"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"phone", "otp"},
     *              @OA\Property(property="phone", type="string", example="+1234567890"),
     *              @OA\Property(property="otp", type="string", example="123456")
     *          )
     *     ),
     *     @OA\Response(response=200, description="OTP verified successfully", @OA\JsonContent(
     *         type="object",
     *         @OA\Property(property="message", type="string", example="OTP verified successfully"),
     *         @OA\Property(property="token", type="string", example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
     *     )),
     *     @OA\Response(response=400, description="Invalid OTP or phone number"),
     *     @OA\Response(response=429, description="Too many attempts"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function verifyOTP(Verify2FARequest $request)
    {
        try {
            $response = $this->passwordResetService->verifyOTP($request->phone, $request->otp);
            return response()->json($response, $response['status']);
        } catch (\Exception $e) {
            Log::error("OTP verification failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to verify OTP.'], 500);
        }
    }


    /**
     * @OA\Post(
     *     path="/api/reset-password",
     *     summary="Reset password using token or otp with email or phone",
     *     tags={"Account"},
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(ref="#/components/schemas/ResetPasswordRequest")
     *     ),
     *     @OA\Response(response=200, description="Password reset successful"),
     *     @OA\Response(response=400, description="Invalid token or email"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        try {
            $data = $request->validated();

            if (isset($data['email'])) {
                Log::info("Processing password reset for email: {$data['email']}");
            } elseif (isset($data['phone'])) {
                Log::info("Processing password reset for phone: {$data['phone']}");
            } else {
                return response()->json(['message' => 'Email or phone is required.'], 400);
            }

            $response = $this->passwordResetService->resetPassword($data);

            return response()->json(['message' => $response['message']], $response['status']);
        } catch (\Exception $e) {
            $identifier = $data['email'] ?? $data['phone'] ?? 'unknown';
            Log::error("Error in password reset for identifier: {$identifier}", ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Invalid token, email, or phone provided.'], 400);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Logout user",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\Response(response=204, description="Logout successful"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function logout(Request $request)
    {
        Log::info("Processing logout request.");

        try {
            $message = $this->authService->logout($request);

            return $this->response([
                'message' => $message
            ], 204);
        } catch (\Exception $e) {
            Log::error("Logout error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred while logging out.'], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/delete",
     *     summary="Delete user account",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\Response(response=204, description="Account deleted successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=500, description="Server error")
     * )
     */
    public function delete(Request $request)
    {
        Log::info("Processing account deletion request.");

        try {
            $message = $this->authService->delete($request);

            return $this->response([
                'message' => $message
            ], 204);
        } catch (\Exception $e) {
            Log::error("Delete error: " . $e->getMessage());
            return $this->response(['message' => 'An error occurred while deleting the account.'], 500);
        }
    }
}
