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
        $response = \Http::post(config('apitoolz.host').'/apps/v1/blend', [
            'tpl' => $str,
            'codes' => json_encode($data),
            'key' => config('apitoolz.activated_key')
        ]);
        if($response->failed()) {
            switch ($response->status()) {
                case 400:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
                case 419:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
                default:
                    echo "{$response->body()}\n";
                    echo "Abort...\n";
                    dd();
                    break;
            }
        }
        if($response->successful()) {
            return $response->body();
        }
    }
}
