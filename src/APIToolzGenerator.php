<?php

namespace Sawmainek\Apitoolz;

class APIToolzGenerator
{
    public static function blend($str, $data)
    {
        $response = \Http::post('http://127.0.0.1:8000/apitoolz/blend', [
            'tpl' => $str,
            'codes' => json_encode($data),
        ]);
        if($response->failed()) {
            dd("Fail to blend model.");
        }
        if($response->successful()) {
            return $response->body();
        }
    }
}