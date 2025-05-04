<?php
namespace Sawmainek\Apitoolz\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SendOTPNotification extends Notification
{
    use Queueable;

    protected $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function via($notifiable)
    {
        \Log::info('Sending OTP notification to notifiable:', ['notifiable' => $notifiable]);
        if (!empty($notifiable->phone)) {
            return ['sms'];
        }
        return ['mail'];
    }

    public function toSms($notifiable)
    {
        return "Your 2FA OTP code is: {$this->otp}";
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your 2FA Code')
            ->line("Your OTP is: {$this->otp}")
            ->line('It will expire in 10 minutes.');
    }
}
