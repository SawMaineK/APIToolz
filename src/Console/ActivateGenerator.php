<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\DatatableBuilder;

class ActivateGenerator extends Command
{
    public $fields = [];
    public function __construct()
    {
        parent::__construct();
    }
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'apitoolz:activate {--dns=} {--key=demo}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Activate your DNS and purchase key';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Activating your DNS and Key...');
        \Artisan::call('install:api --without-migration-prompt');
        \Artisan::call('vendor:publish', ['--provider'=>'Laravel\Scout\ScoutServiceProvider']);
        \Artisan::call('vendor:publish', ['--provider'=>'L5Swagger\L5SwaggerServiceProvider']);
        \Artisan::call('vendor:publish', ['--provider'=>'Sawmainek\Apitoolz\APIToolzServiceProvider','--tag' => 'config', '--force'=> true]);

        \Artisan::call('config:clear');
        $dns = $this->option('dns');
        if($dns == '') {
            $dns = $this->ask("Please set your DNS.","http://127.0.0.1:8000");
        }
        $this->info("Activate DNS={$dns}");
        $this->info("Purchase Key={$this->option('key')}");
        $response = \Http::post(config('apitoolz.host','http://127.0.0.1:8000').'/apps/activation', [
            'dns' => $dns,
            'key' => $this->option('key')
        ]);
        if($response->failed()) {
            switch ($response->status()) {
                case 400:
                    return $this->error("{$response->body()}");
                case 419:
                    return $this->error("{$response->body()}");
                default:
                    return $this->error("{$response->body()}");
            }

        }
        if($response->successful()) {
            $data = json_decode($response->body(), true);
            if($data['activated_dns'] == $dns) {
                $this->updateEnvFile([
                    "SCOUT_DRIVER" => 'database',
                    "APITOOLZ_PURCHASE_KEY" => $data['purchase_key'],
                    "APITOOLZ_ACTIVATED_KEY" => $data['activated_key'],
                    "APITOOLZ_ACTIVATED_DNS" => $data['activated_dns']
                ]);
            }
        }

    }

    function updateEnvFile(array $data)
    {
        // Read the contents of the .env file
        $envFile = base_path('.env');
        $contents = \File::get($envFile);

        // Split the contents into an array of lines
        $lines = explode("\n", $contents);

        // Loop through the lines and update the values
        foreach ($lines as &$line) {
            // Skip empty lines and comments
            if (empty($line) || \Str::startsWith($line, '#')) {
                continue;
            }

            // Split each line into key and value
            $parts = explode('=', $line, 2);
            $key = $parts[0];

            // Check if the key exists in the provided data
            if (isset($data[$key])) {
            // Update the value
            $line = $key . '=' . $data[$key];
                unset($data[$key]);
            }
        }

        // Append any new keys that were not present in the original file
        foreach ($data as $key => $value) {
            $lines[] = $key . '=' . $value;
        }
        // Combine the lines back into a string
        $updatedContents = implode("\n", $lines);

        // Write the updated contents back to the .env file
        \File::put($envFile, $updatedContents);
    }
}
