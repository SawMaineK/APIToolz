<?php

namespace Sawmainek\Apitoolz\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\ResetPassword;
use Sawmainek\Apitoolz\Models\User;
use Sawmainek\Apitoolz\Http\Requests\LoginRequest;
use Sawmainek\Apitoolz\Http\Requests\RegisterRequest;
use Sawmainek\Apitoolz\Http\Requests\ProfileRequest;
use Sawmainek\Apitoolz\Http\Requests\ChangePasswordRequest;
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
     *          @OA\JsonContent(ref="#/components/schemas/LoginRequest")
     *     ),
     *     @OA\Response(response=200, description="Successful operation"),
     *     @OA\Response(response=400, description="Invalid request")
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'phone', 'password');
        if (\Auth::attempt($credentials)) {
            $user = User::find(\Auth::user()->id);
            $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;
            return $this->response($user);
        }
        return $this->response("The username and password are incorrect.", 400);
    }

    /**
     * Swagger API Document
     * @OA\Post(
     *     path="/api/register",
     *     summary="Register to your account",
     *     tags={"Account"},
     *     @OA\RequestBody(
     *          required=true,
     *          description = "Register Request",
     *          @OA\JsonContent(ref="#/components/schemas/RegisterRequest")
     *     ),
     *     @OA\Response(response=200, description="Successful operation"),
     *     @OA\Response(response=400, description="Invalid request")
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function register(RegisterRequest $request)
    {
        $data['name'] = $request->input('name');
        $data['email'] = $request->input('email');
        $data['phone'] = $request->input('phone');
        $data['password'] = bcrypt($request->input('password'));
        $data['gender'] = $request->input('gender');
        $data['dob'] = $request->input('dob');

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

        $data['token'] = bcrypt($request->token_2fa);
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

    /**
     * Swagger API Document
     * @OA\Post(
     *     path="/api/edit-profile",
     *     summary="Edit to your account",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *          description = "Edit Request",
     *          @OA\JsonContent(ref="#/components/schemas/ProfileRequest")
     *     ),
     *     @OA\Response(response=200, description="Successful operation"),
     *     @OA\Response(response=400, description="Invalid request")
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function editProfle(ProfileRequest $request)
    {
        $user = $request->user();

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

        if($request->input('password')) {
            $user->password = bcrypt($request->input('password'));
        }

        $user->name = $request->input('name') ?? $user->name;
        $user->email = $request->input('email') ?? $user->email;
        $user->phone = $request->input('phone') ?? $user->phone;
        $user->gender = $request->input('gender') ?? $user->gender;
        $user->dob = $request->input('dob') ?? $user->dob;

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
            $user->password = bcrypt($password);

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

    /**
     * Swagger API Document
     * @OA\Post(
     *     path="/api/change-password",
     *     summary="Change to your password",
     *     tags={"Account"},
     *     security={{"apiAuth":{}}},
     *     @OA\RequestBody(
     *          required=true,
     *          description = "Change Password Request",
     *          @OA\JsonContent(ref="#/components/schemas/ChangePasswordRequest")
     *     ),
     *     @OA\Response(response=200, description="Successful operation"),
     *     @OA\Response(response=400, description="Invalid request")
     * )
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();

        $credentials = ['email'=>$user->email, 'password'=>$request->input('current_password')];
        if (!\Auth::guard('web')->attempt($credentials)) {
            return $this->response("The current password is invalid.", 400);
        }

        $user->password = bcrypt($request->input('password'));
        $user->save();

        $user->tokens()->delete();
        $user->personal_access_token = $user->createToken("{$user->name}'s Access Token")->plainTextToken;

        return $this->response($user);

    }
}
