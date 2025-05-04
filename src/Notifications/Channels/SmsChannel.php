<?php
namespace Sawmainek\Apitoolz\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Sawmainek\Apitoolz\Contracts\SmsSenderInterface;

class SmsChannel
{
    protected $sms;

    public function __construct(SmsSenderInterface $sms)
    {
        $this->sms = $sms;
    }

    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toSms')) {
            return;
        }

        $message = $notification->toSms($notifiable);
        $this->sms->send($notifiable->phone, $message);
    }
}
