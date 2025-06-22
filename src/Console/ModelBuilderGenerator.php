<?php

namespace Sawmainek\Apitoolz\Console;

use Illuminate\Console\Command;
use Sawmainek\Apitoolz\Models\Model;
use Sawmainek\Apitoolz\Facades\ModelConfigUtils;
use Sawmainek\Apitoolz\ModelBuilder;
use Sawmainek\Apitoolz\DatatableBuilder;
use Sawmainek\Apitoolz\APIToolzGenerator;
use Illuminate\Support\Facades\Artisan;

class ModelBuilderGenerator extends Command
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
    protected $signature = 'apitoolz:build {--build-from-script} {--build-from-db} {--all} {--tables=} {--skip-tables=} {--doc}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('doc')) {
            $this->printDocumentation();
            return;
        }

        $this->info('Get started ...');
        $skipTables = [
            'cache',
            'cache_locks',
            'jobs',
            'failed_jobs',
            'job_batches',
            'migrations',
            'roles',
            'model_has_permissions',
            'model_has_roles',
            'models',
            'password_reset_tokens',
            'permissions',
            'personal_access_tokens',
            'role_has_permissions',
            'sessions',
            'users',
            'app_settings'
        ];
        if($this->option('build-from-db')) {
            $this->info('Generating from database existing tables');
            $tables = \Schema::getTableListing();
            $userSkipTables = $this->option('skip-tables') ? explode(',', $this->option('skip-tables')) : [];
            $skipTables = array_merge($skipTables, $userSkipTables);
            $tables = array_filter($tables, function($table) use ($skipTables) {
                return !in_array($table, $skipTables);
            });
            $this->info('Building tables: '. implode(',', $tables) .'');
            foreach($tables as $table) {
                $name = collect(explode('_',$table))->map(function ($name) {
                    return ucfirst($name);
                })->implode('');
                $name = \Str::singular($name);
                $useSoftDelete = \Schema::hasColumn($table, 'deleted_at');
                $this->info('Building for '. $name .'');
                $fields = \Schema::getColumnListing($table);
                $response = APIToolzGenerator::ask("Create new model and possible configuration commands for $name".$useSoftDelete ?? " with --soft-delete".". Give command list only.", "{$this->getHint()}", $name, $fields, ['build','general']);
                foreach($response as $result) {
                    if (is_string($result->content)) {
                        preg_match_all("/'php artisan .*?'/", $result->content, $matches);

                        // Clean up the quotes
                        $commands = array_map(function ($cmd) {
                            return trim($cmd, "'");
                        }, $matches[0]);

                        // Output the result
                        foreach ($commands as $command) {
                            echo $command . PHP_EOL;
                            // Execute the artisan command
                            $artisanCommand = str_replace('php artisan ', '', $command);
                            Artisan::call($artisanCommand);
                            $this->info(Artisan::output());
                        }
                    }
                }

                $this->info('Building successful for '. $name .'');
            }
            $this->info('Successful model generating...');
        }
    }

    protected function getHint()
    {
        return "
for cmd in \
    'php artisan apitoolz:model Product --table=products --use-auth --use-policy --use-roles=admin,user --force' \
    'php artisan apitoolz:request Product --field=category_id --input-type=select --opt-type=external --lookup-model=Category --lookup-value=name' \
    'php artisan apitoolz:request Product --field=name --validator=\"required|string|max:255\" --input-type=text' \
    'php artisan apitoolz:request Product --field=price --validator=\"required|numeric|min:0\" --input-type=number' \
    'php artisan apitoolz:request Product --field=description --input-type=textarea' \
    'php artisan apitoolz:response Product --field=name --label=\"Product Name\" --visible=true --export=true --position=1' \
    'php artisan apitoolz:response Product --field=price --label=\"Price\" --visible=true --export=true --position=2' \
    'php artisan apitoolz:response Product --field=category_id --label=\"Category\" --visible=true --export=true --position=3' \
    'php artisan apitoolz:summary Product --title=\"Total Products\" --type=kpi --method=count --force' \
    'php artisan apitoolz:summary Product --title=\"Total Inventory Value\" --type=kpi --method=sum --column=price --force' \
    'php artisan apitoolz:relation Product --title=category --relation-model=Category --relation-type=belongsTo --foreign-key=category_id --force' \
    'php artisan apitoolz:filter Product --title=\"category\" --filter-type=select --filter-model=Category --filter-key=category_id --filter-value=id --filter-label=name --force' \
    'php artisan apitoolz:filter Product --title=\"price_range\" --filter-type=radio --filter-query=\"low:<50|medium:50-100|high:>100\" --filter-key=price --force'
do
    echo \"Running: \$cmd\"
    eval \$cmd
done";
    }

    protected function printDocumentation()
    {

    }

}
