<?php

namespace Sawmainek\Apitoolz\Services;

use Sawmainek\Apitoolz\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function login(array $credentials)
    {
        Log::info("Login request received.", ['email' => $credentials['email'] ?? null]);

        if (Auth::attempt($credentials)) {
            $user = User::find(Auth::user()->id);
            $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;

            Log::info("User logged in successfully.", ['user_id' => $user->id]);
            return $user;
        }

        Log::warning("Invalid login attempt.", ['email' => $credentials['email'] ?? null]);
        return null;
    }

    public function findByEmail(string $email)
    {
        Log::info("Searching for user with email: {$email}");

        try {
            return User::where('email', $email)->first();
        } catch (\Exception $e) {
            Log::error("Error finding user by email: {$e->getMessage()}");
            return null;
        }
    }

    public function findByPhoneNumber(string $phoneNumber)
    {
        Log::info("Searching for user with phoneNumber: {$phoneNumber}");

        try {
            return User::where('phone', $phoneNumber)->first();
        } catch (\Exception $e) {
            Log::error("Error finding user by phoneNumber: {$e->getMessage()}");
            return null;
        }
    }
    public function generateAuthToken($user)
    {
        Log::info("Generating authentication token for user.", ['user_id' => $user->id]);

        try {
            // Generate new personal access token
            $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;

            Log::info("Authentication token generated successfully.", ['user_id' => $user->id]);
            return $user;
        } catch (\Exception $e) {
            Log::error("Error generating auth token.", ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return null;
        }
    }

    public function register(array $data, Request $request)
    {
        Log::info("Registration request received.", ['email' => $data['email'] ?? $data['phone']]);

        $data['password'] = bcrypt($data['password']);

        if ($request->hasFile('avatar') && $request->file('avatar')->isValid()) {
            $avatar = $request->file('avatar')->store('avatars', env('FILESYSTEM_DISK', 'public'));
            $data['avatar'] = $avatar;
        }

        $user = User::create($data);
        $userRole = Role::firstOrCreate(['name' => 'user','guard_name' => 'sanctum']);
        $user->roles()->attach($userRole->id, ['model_type' => User::class]);
        $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;
        Log::info("User registered successfully.", ['user_id' => $user->id]);

        return $user;
    }

    public function editProfile(User $user, array $data)
    {
        Log::info("Updating profile for user ID: {$user->id}", ['data' => $data]);

        // Handle avatar upload
        if (isset($data['avatar']) && $data['avatar']->isValid()) {
            $avatarPath = $data['avatar']->store('avatars', env('FILESYSTEM_DISK', 'public'));
            $data['avatar'] = $avatarPath;
        }

        // Handle password update
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // Update user details
        $user->update($data);

        Log::info("Profile updated successfully for user ID: {$user->id}");

        return $user;
    }

    public function getUser(Request $request)
    {
        $user = User::find($request->user()->id);
        Log::info("Fetching user details.", ['user_id' => $user->id]);
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'is_active' => $user->is_active,
            'last_activity' => $user->last_activity,
            'personal_access_token' => $request->user()->currentAccessToken()->plainTextToken,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    public function changePassword($user, $data)
    {
        Log::info("Verifying current password for user ID: {$user->id}");

        // Validate old password
        if (!Hash::check($data['current_password'], $user->password)) {
            Log::warning("Password verification failed for user ID: {$user->id} - Incorrect current password.");
            return ['success' => false, 'message' => 'Current password is incorrect'];
        }

        // Update password
        $user->update(['password' => Hash::make($data['new_password'])]);

        Log::info("Password updated successfully for user ID: {$user->id}");
        return ['success' => true, 'message' => 'Password changed successfully'];
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        Log::info("User logged out.", ['user_id' => $user->id]);

        return "Account logout successful.";
    }

    public function delete(Request $request)
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $user->delete();

        Log::info("User account deleted.", ['user_id' => $user->id]);

        return "Account deleted successfully.";
    }
}
