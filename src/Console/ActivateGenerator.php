<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;

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
    protected $signature = 'apitoolz:activate {--client-dns=} {--purchase-key=}';

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

        $dns = $this->option('client-dns');
        if($dns == '') {
            $dns = $this->ask("Please set your DNS.","http://localhost:8100");
        }
        $this->info("Activate DNS={$dns}");
        $key = $this->option('purchase-key');
        if($key == '') {
            $hasKey = $this->ask("Do you have purchase key?.(yes/no)","yes");
            if($hasKey == 'yes' || $hasKey == 'y') {
                $key = $this->ask("Please enter purchase key");
            } else {
                $requestDemoKey = $this->ask("Would you be interested in requesting a demo key?.(yes/no)","yes");
                if($requestDemoKey == 'yes' || $requestDemoKey == 'y') {
                    $email = $this->ask("Please provide your email address. We will send the demo key to you shortly.");
                    $roles = [
                        'email' => 'required|email'
                    ];
                    $validator = \Validator::make(['email'=>$email], $roles);
                    if ($validator->fails()) {
                        foreach($validator->errors()->messages() as $key => $err) {
                            $this->error($err[0]);
                        }
                        return;
                    }
                    $response = \Http::post(config('apitoolz.host','https://apitoolz.com').'/apps/request-demo', [
                        'email' => $email,
                    ]);
                    if($response->failed()) {
                        return $this->error("{$response->body()}");
                    }
                    if($response->successful()) {
                        return $this->info("Please check your email for the demo key. If you've received the purchase key, kindly attempt activation again using the --purchase-key=****.");
                    }
                }else {
                    return $this->warn("Activation abort...");
                }

            }
        }
        $this->info("Purchase Key={$key}");
        $response = \Http::post(config('apitoolz.host','https://apitoolz.com').'/apps/activation', [
            'client_dns' => $dns,
            'purchase_key' => $key
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
            if($data['client_dns'] == $dns) {
                $this->updateEnvFile([
                    "APITOOLZ_PURCHASE_KEY" => $data['purchase_key'],
                    "APITOOLZ_ACTIVATED_KEY" => $data['activated_key'],
                    "APITOOLZ_ACTIVATED_DNS" => $data['client_dns']
                ]);
                \Artisan::call('config:clear');

                return $this->info("Activation has successfully. Now, you can create model using the `apitoolz:model`");
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
