<?php

namespace Sawmainek\Apitoolz;

class APIToolzGenerator
{
    public static function blend($str, $data)
    {
        if(config('apitoolz.host') == '') {
            echo "Please define apitoolz host url in env.\n";
            echo "Abort...\n";
            dd();
        }
        if(config('apitoolz.purchase_key') == '') {
            echo "Please define your apitoolz purchase key in env.\n";
            echo "Abort...\n";
            dd();
        }
        if(config('apitoolz.activated_key') == '') {
            echo "Please define your apitoolz activated key in env.\n";
            echo "Abort...\n";
            dd();
        }
        $response = \Http::post(config('apitoolz.host'), [
            'tpl' => $str,
            'codes' => json_encode($data),
        ]);
        if($response->failed()) {
            echo "Fail to blend model. Please contact US.\n";
            echo "Abort...\n";
            dd();
        }
        if($response->successful()) {
            return $response->body();
        }
    }
}