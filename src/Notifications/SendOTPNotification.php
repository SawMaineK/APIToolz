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
        \Log::info('Sending OTP notification to notifiable:', [
            'notifiable' => $notifiable,
            'user_agent' => request()->header('User-Agent')
        ]);
        $userAgent = strtolower(request()->header('User-Agent', ''));
        $isMobile = preg_match('/android|iphone|ipad|ipod|blackberry|windows phone|opera mini|mobile|dart\/[0-9\.]+ \(dart:io\)|reactnative|ionic/i', $userAgent);

        if ($isMobile && !empty($notifiable->phone)) {
            return ['sms'];
        } elseif (!empty($notifiable->email)) {
            return ['mail'];
        }
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
