<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ResetPassword;
use Sawmainek\Apitoolz\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AuthController extends APIToolzController
{
    /**
     * Swagger API Document
     * @OA\Post(
     *     path="/api/login",
     *     summary="Login to your account",
     *     tags={"Account"},
     *     @OA\RequestBody(
     *          required=true,
     *          description = "Login Request",
     *          @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(response=200, description="Successful operation", @OA\JsonContent(ref="#/components/schemas/User")),
     *     @OA\Response(response=400, description="Invalid request")
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $roles = [
            'password' => ['required', 'string', 'min:6']
        ];

        if ($request->phone) {
            $roles['phone'] = ['required', 'string'];
        }

        $validator = \Validator::make($request->all(), $roles);

        if ($validator->fails()) {
            return  $this->response($validator->errors(), 400);
        }

        $credentials = $request->only('email', 'phone', 'password');

        if (\Auth::attempt($credentials)) {
            $user = User::find(\Auth::user()->id);
            $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;
            return $this->response($user);
        }
        return $this->response("The username and password are incorrect.", 400);
    }

    public function register(Request $request)
    {
        $roles = [
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ];

        if($request->email) {
            $roles['email'] = ['required', 'string', 'email', 'max:255', 'unique:users'];
        }

        if ($request->phone) {
            $roles['phone'] = ['required', 'string', 'max:255', 'unique:users'];
        }

        if(!$request->email && !$request->phone) {
            $roles['email'] = ['required', 'string', 'email', 'max:255', 'unique:users'];
            $roles['phone'] = ['required', 'string', 'max:255', 'unique:users'];
        }

        if($request->hasFile('avatar')) {
            $roles['avatar'] = ['required','mimes:jpeg,jpg,png','max:1024'];
        }

        $validator = \Validator::make($request->all(), $roles);

        if ($validator->fails()) {
            return  $this->response($validator->errors(), 400);
        }

        $data['name'] = $request->name;
        $data['email'] = $request->email;
        $data['phone'] = $request->phone;
        $data['password'] = \Hash::make($request->password);
        $data['gender'] = $request->gender;
        $data['dob'] = $request->dob;
        if ($request->hasFile('avatar') &&  $request->file('avatar')->isValid()) {

            $filename = date("Ymdhms") . "-" . mt_rand(100000, 999999) . "." . $request->avatar->extension();
            $avatar = $this->saveAsFile($request->file('avatar'), array(
                'image_multiple' => false,
                'save_full_path' => false,
                'path_to_upload' => 'users',
                'upload_type' => 'image',
                'upload_max_size' => '1',
            ));
            $data['avatar'] = $avatar;
        }
        $user = User::create($data);

        return $this->response($user);
    }

    /**
     * Swagger API Document
     * @OA\Get(
     *     path="/api/user",
     *     summary="Get the authenticated user",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\Response(response=200, description="Successful operation"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     *
     * Display the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        $user = $request->user();
        if($user) {
            $data = User::find($user->id);
            return $this->response($data);
        }
        return $this->response("Invalid user access.", 400);
    }

    public function getVerificationCode(Request $request, $type)
    {
        $roles = [];

        if($type == 'email') {
            $roles['email'] = ['required', 'string', 'email', 'exists:users,email'];
        }

        if($type == 'phone') {
            $roles['phone'] = ['required', 'string', 'exists:users,phone'];
        }

        $validator = \Validator::make($request->all(), $roles);

        if ($validator->fails()) {
            return  $this->response($validator->errors(), 400);
        }
        $timeout = env('2FACTOR_TIMEOUT');
        if($request->timeout && $request->timeout > 0) {
            $timeout = $request->timeout;
        }
        if($type == 'email') {
            $user = User::where('email', $request->email)->first();
            $user->token_2fa_expiry = \Carbon\Carbon::now()->addMinutes($timeout);
            $user->token_2fa = mt_rand(1000, 9999);
            $user->save();
            $send['to'] = [ 'email' => $user->email ];
            //Mail::to($send)->send(new TwoFactor($user));
        }

        if($type == 'phone') {
            $user = User::where('phone', $request->phone)->first();
            $user->token_2fa_expiry = \Carbon\Carbon::now()->addMinutes($timeout);
            $user->token_2fa = mt_rand(1000, 9999);
            $user->save();

        }

        $data['token'] = \Hash::make($user->token_2fa);
        return $this->response($data);
    }

    public function postVerifyPhoneEmail(Request $request)
    {
        $roles = [
            'code' => ['required', 'string', 'min:4', 'exists:users,token_2fa'],
            'token' => ['required', 'string']
        ];
        $validator = \Validator::make($request->all(), $roles);

        if ($validator->fails()) {
            return  $this->response($validator->errors(), 400);
        }
        if (!\Hash::check($request->code, $request->token)) {
            return $this->response("The token and code are invalid.", 400);
        }
        $user = User::where('token_2fa', $request->code)->first();
        if($user) {
            // Check code is expired?
            if ($user->token_2fa_expiry < \Carbon\Carbon::now()) {
                return $this->response("The verification code has expired.", 400);
            }
            $user->token_2fa_expiry = \Carbon\Carbon::now()->addDays(env('2FACTOR_LIFETIME'));
            $user->save();

            $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;
            return $this->response($user);

        }
        return $this->response("The verification code is invalid.", 400);
    }

    public function editProfle(Request $request)
    {
        $user = $request->user();
        $roles = [
            'name' => ['required', 'string', 'max:255'],
        ];

        if ($request->email) {
            $roles['email'] = ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)];
        }

        if ($request->phone) {
            $roles['phone'] = ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)];
        }

        if ($request->password) {
            $roles['password'] = ['required', 'string', 'min:6', 'confirmed'];
        }

        if($request->hasFile('avatar')) {
            $roles['avatar'] = ['required','mimes:jpeg,jpg,png','max:1024'];
        }

        $validator = \Validator::make($request->all(), $roles);

        if ($validator->fails()) {
            return  $this->response($validator->errors(), 400);
        }

        if ($request->hasFile('avatar') &&  $request->file('avatar')->isValid()) {
            $filename = date("Ymdhms") . "-" . mt_rand(100000, 999999) . "." . $request->avatar->extension();
            $avatar = $this->saveAsFile($request->file('avatar'), array(
                'image_multiple' => false,
                'save_full_path' => false,
                'path_to_upload' => 'users',
                'upload_type' => 'image',
                'upload_max_size' => '1',
            ));
            $user->avatar = $avatar;
        }

        if($request->password) {
            $user->password = \Hash::make($request->password);
        }

        $user->name = $request->name ?? $user->name;
        $user->email = $request->email ?? $user->email;
        $user->phone = $request->phone ?? $user->phone;
        $user->gender = $request->gender ?? $user->gender;
        $user->dob = $request->dob ?? $user->dob;

        $user->save();
        return $this->response($user);
    }

    public function postResetPassword(Request $request)
    {
        $roles = [
            'code' => ['required', 'string', 'min:4', 'exists:users,token_2fa'],
            'token' => ['required', 'string']
        ];
        $validator = \Validator::make($request->all(), $roles);

        if ($validator->fails()) {
            return  $this->response($validator->errors(), 400);
        }
        if (!\Hash::check($request->code, $request->token)) {
            return $this->response("The token and code are invalid.", 400);
        }
        $user = User::where('token_2fa', $request->code)->first();
        if ($user) {
            // Check code is expired?
            if ($user->token_2fa_expiry < \Carbon\Carbon::now()) {
                return $this->response("The verification code has expired.", 400);
            }

            $password =  \Str::random(6);
            $user->password = \Hash::make($password);

            $user->save();

            if($user->email) {
                $send['to'] = ['email' => $user->email];
                //\Mail::to($send)->send(new ResetPassword($user, $password));
            }
            if ($user->phone) {
                //Send News Passsword your own sms priveder
            }

            $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;
            return $this->response($user);
        }
        return $this->response("The verification code is invalid.", 400);
    }

    public function postChangePassword(Request $request, User $user)
    {
        $roles = [
            'current_password' => ['required', 'string', 'min:6'],
            'password' => ['required', 'string', 'min:6', 'confirmed']
        ];

        $validator = \Validator::make($request->all(), $roles);

        if ($validator->fails()) {
            return  $this->response($validator->errors(), 400);
        }

        if (!\Hash::check($request->current_password, $user->password)) {
            return $this->response("The current password is invalid.", 400);
        }

        $user->password = \Hash::make($request->password);
        $user->save();

        $user->tokens()->delete();
        $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;

        return $this->response($user);

    }
}
