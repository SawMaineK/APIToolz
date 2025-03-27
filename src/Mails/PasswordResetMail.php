<?php

namespace Sawmainek\Apitoolz\Mails;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $token;

    public function __construct($user, $token)
    {
        $this->user = $user;
        $this->token = $token;
    }

    public function build()
    {
        return $this->subject('Reset Your Password')
                    ->view('apitoolz::emails.password_reset')
                    ->with([
                        'user' => $this->user,
                        'resetLink' => url('/apitoolz/auth/reset-password/change?token=' . $this->token.'&email='.$this->user->email)
                    ]);
    }
}
