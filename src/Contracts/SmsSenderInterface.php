<?php
namespace Sawmainek\Apitoolz\Contracts;

interface SmsSenderInterface
{
    public function send(string $to, string $message): void;
}
