<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;

class APIRestfulGenerator extends Command
{
    public function __construct()
    {
        parent::__construct();
    }
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'apitoolz:generate {--model=*}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate Restful API based on provided model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating Restful API...');
        //Check model is alreay exist
        $this->info('Provided model is '. $model);
        //Else Generate Model
    }
}
