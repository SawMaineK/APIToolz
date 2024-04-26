<?php

namespace Sawmainek\Apitoolz;

class APIToolzGenerator
{
    public static function blend($str, $data)
    {
        self::verifyValitation();
        $response = \Http::post(config('apitoolz.host').'/apps/v1/blend', [
            'tpl' => $str,
            'codes' => json_encode($data),
            'key' => config('apitoolz.activated_key')
        ]);
        if($response->failed()) {
            switch ($response->status()) {
                case 400:
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

    public static function askSolution($requirement, $dummy = false)
    {
        self::verifyValitation();
        $response = \Http::post(config('apitoolz.host').'/apps/ai/ask', [
            'ask' => $requirement,
            'dummy' => $dummy,
            'key' => config('apitoolz.activated_key')
        ]);
        if($response->failed()) {
            switch ($response->status()) {
                case 400:
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
            return json_decode($response->body());
        }
    }

    static function verifyValitation() {
        if(config('apitoolz.host') == '') {
            echo "Please define APITOOLZ_HOST= in env.\n";
            echo "Abort...\n";
            dd();
        }
        if(config('apitoolz.purchase_key') == '') {
            echo "Please define APITOOLZ_PURCHASE_KEY= in env.\n";
            echo "Abort...\n";
            dd();
        }
        if(config('apitoolz.activated_key') == '') {
            echo "Please define APITOOLZ_ACTIVATED_KEY= in env.\n";
            echo "Abort...\n";
            dd();
        }
    }


}
