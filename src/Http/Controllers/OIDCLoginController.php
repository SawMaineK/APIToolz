<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Jumbojett\OpenIDConnectClient;
use Sawmainek\Apitoolz\Models\User;
use Spatie\Permission\Models\Role;

class OIDCLoginController extends APIToolzController
{
    protected function getOidcClient(): OpenIDConnectClient
    {
        $oidc = new OpenIDConnectClient(
            env('OIDC_PROVIDER_URL'),
            env('OIDC_CLIENT_ID'),
            env('OIDC_CLIENT_SECRET')
        );

        // For dev only: disable SSL verification
        $oidc->setVerifyHost(false);
        $oidc->setVerifyPeer(false);

        $oidc->setRedirectURL(env('OIDC_REDIRECT_URI'));
        $oidc->addScope(explode(' ', env('OIDC_SCOPES', 'openid profile email')));

        return $oidc;
    }

    public function login()
    {
        $oidc = $this->getOidcClient();

        $oidc->authenticate();

        $claims = $oidc->requestUserInfo();

        // --- Find or create user ---
        $user = User::updateOrCreate(
            ['email' => $claims->email ?? null],
            [
                'name'    => $claims->name ?? ($claims->given_name ?? 'Unknown'),
                'oidc_id' => $claims->sub ?? null
            ]
        );

        // --- Extract roles/groups from claims ---
        $allRoles = [];

        if (!empty($claims->roles)) {
            $allRoles = array_merge($allRoles, (array) $claims->roles);
        }

        if (!empty($claims->groups)) {
            $allRoles = array_merge($allRoles, array_map(fn($g) => ltrim($g, '/'), (array) $claims->groups));
        }

        if (!empty($claims->realm_access->roles)) {
            $allRoles = array_merge($allRoles, (array) $claims->realm_access->roles);
        }

        if (!empty($claims->resource_access)) {
            foreach ($claims->resource_access as $access) {
                $allRoles = array_merge($allRoles, $access->roles ?? []);
            }
        }

        $allRoles = array_unique($allRoles);

        // --- Assign default role if no roles provided ---
        if (empty($allRoles)) {
            $allRoles = ['user'];
        }

        // --- Ensure roles exist with correct guard ---
        foreach ($allRoles as $roleName) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'sanctum',
            ]);
            $user->roles()->sync($role, ['model_type' => User::class]);
        }

        // --- Create Sanctum token for React ---
        $token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;

        // --- Login user in Laravel session ---
        Auth::login($user);

        // --- Redirect to React callback with token ---
        return redirect("/admin/auth/callback?token={$token}");
    }

    public function logout()
    {
        Auth::logout();
        session()->invalidate();
        session()->regenerateToken();
        return redirect('/admin');
    }
}
