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
    ],

    'workflow' => [
        /*
         * Define the fully-qualified model classes that workflows are permitted to
         * create or update. Restricting the list prevents malicious workflow
         * definitions from interacting with unexpected Eloquent models.
         */
        'allowed_models' => [
            // Example: App\Models\Order::class,
        ],
    ],
];
