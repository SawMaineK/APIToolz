<?php

return [
    /*
     * Edit to include host url for APIToolz
     */
    'host' => env('APITOOLZ_HOST', 'https://apitoolz.com'),

    /*
     * Edit to include your APIToolz purchase key
     */
    'purchase_key' => env('APITOOLZ_PURCHASE_KEY', ''),

    /*
     * Edit to include your APIToolz activated key
     */
    'activated_key' => env('APITOOLZ_ACTIVATED_KEY', ''),

    'log' => [
        'enable' => env('LOG_DEBUG', true),
    ]
];
