<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\RouterBuilder;
use Sawmainek\Apitoolz\SeederBuilder;

class ModelRemover extends Command
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
    protected $signature = 'apitoolz:remove-model {model} {--force-delete}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove Restful API based on provided model.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Removing Model...');

        $name = $this->argument('model');
        $model = Model::where('name', $name)->first();
        if($model) {

            //\Artisan::call('scout:flush', ["model" => "App\\Models\\{$model->name}"]);

            @unlink(app_path("Http/Controllers/{$model->name}Controller.php"));
            @unlink(app_path("Models/{$model->name}.php"));
            @unlink(app_path("Exports/{$model->name}Export.php"));
            @unlink(app_path("Policies/{$model->name}Policy.php"));
            @unlink(app_path("Mails/{$model->name}Mail.php"));
            @unlink(app_path("Jobs/ProcessCreated{$model->name}.php"));
            @unlink(app_path("Jobs/ProcessUpdated{$model->name}.php"));
            @unlink(app_path("Jobs/ProcessDeleted{$model->name}.php"));
            @unlink(app_path("Notifications/{$model->name}CreatedNotification.php"));
            @unlink(app_path("Notifications/{$model->name}UpdatedNotification.php"));
            @unlink(app_path("Notifications/{$model->name}DeletedNotification.php"));
            @unlink(app_path("Events/{$model->name}CreatedEvent.php"));
            @unlink(app_path("Events/{$model->name}UpdatedEvent.php"));
            @unlink(app_path("Events/{$model->name}DeletedEvent.php"));
            @unlink(base_path("resources/views/emails/{$model->slug}.blade.php"));
            @unlink(base_path("resources/views/emails/{$model->slug}-created.blade.php"));
            @unlink(base_path("resources/views/emails/{$model->slug}-updated.blade.php"));
            @unlink(base_path("resources/views/emails/{$model->slug}-deleted.blade.php"));

            
            if($this->option('force-delete')) {
                $model->forceDelete();
                $this->info("This $name model has permanently deleted successfully.");
            } else {
                $model->delete();
                $this->info("This $name model has deleted successfully.");
            }

            RouterBuilder::build();
            SeederBuilder::build();  
            
        } else {
            $this->error("This $name model not found.");
        }
        
    
    }

}
