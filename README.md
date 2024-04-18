# APIToolz

APIToolz expeditiously gennerates RESTful APIs within seconds based on a provided model.

## Features

- Create database table migration via Artisan Commands
- Create Restful API via Artisan Commands
- Remove Created Restful API Model via Artisan Commands
- Swagger API Documentation
- Full-text search
- Authentication
- Application user onboarding
- Daily Auto Backup for Code and Database
- Request/Process/Response logging layer `Coming Soon`
- Export/Import Model `Coming Soon` via Artisan Commands

## Requirements

`apitoolz` requires at least PHP 8.2 and Laravel 11.

## Installation (with [Composer](https://getcomposer.org))

```shell
composer require sawmainek/apitoolz
```

Then, you should publish APIToolz configuration file using the `vendor:publish` Artisan command. This command will publish the `apitoolz.php` configuration file to your application's `config` directory:

```shell
php artisan vendor:publish --provider="Sawmainek\Apitoolz\APIToolzServiceProvider" --tag="config"
```

After you installed `sawmainek/apitoolz`, you must install `install:api` and complete the installing steps.

```shell
php artisan install:api
```
NOTE: need to check with US

If you want to customizable view for `export Model`, and etc..

```shell
php artisan vendor:publish --provider="Sawmainek\Apitoolz\APIToolzServiceProvider" --tag="views"
```


## Requirements Dependencies

Install `laravel/scout` dependency for full-text search to your models.

```shell
composer require laravel/scout
```

After installing Scout, you should publish the Scout configuration file using the `vendor:publish` Artisan command. This command will publish the `scout.php` configuration file to your application's `config` directory:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

After installing Sount, you should install driver prerequisites for Sount.

```shell
composer require algolia/algoliasearch-client-php
```

Then, set the SCOUT_DRIVER environment variable as well as your Algolia `app_id` and `secret` credentials within your application's .env file:

```shell
SCOUT_DRIVER=algolia
SCOUT_QUEUE=true
ALGOLIA_APP_ID=YOUR_ALGOLIA_APP_ID
ALGOLIA_SECRET=YOUR_ALGOLIA_SECRET
```

## Swagger Installation for API Document

For Swagger API documentation, you should run the following Artisan commannd.

```shell
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

Then, you can set L5_SWAGGER_GENERATE_ALWAYS to true in your .env file so that your documentation will automatically be generated.

## Usage

Now, you can generate your model using the `apitoolz:model` Artisan command.

```shell
php artisan apitoolz:model Product --table=products --soft-delete
```

And also you can generate your model with `sql format` following as:

```shell
php artisan apitoolz:model Customer --table=customers --soft-delete --sql="
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(100),
    zip_code VARCHAR(20)
);"
```

NOTE: --table=`customers` and --sql="CREATE TABLE `customers` ..." must be same.

After generate, you can check your model Restful API via Swagger API document.
Go to `http://127.0.0.1:8000/api/documentation`

### Model Relationship

If you want to add relationship between two models e.g `belongTo`, `hasOne`, `hasMany`.

```shell
//For belongTo
php artisan apitoolz:relation Sale --title=customer --relation-model=Customer --relation-type=belongsTo --foreign-key=customer_id

//For hasOne
php artisan apitoolz:relation Customer --title=phone --relation-model=Phone --relation-type=hasOne
```

If you want to remove existing relation of provided model,

```shell
php artisan apitoolz:relation Customer --title=phone --remove
```

For additional option of relationships, you can choose parameter as following:

```shell
apitoolz:relation {model} {--title=} {--relation-model=}  {--relation-type=belongsTo} {--foreign-key=} {--display-field=} {--sub-relation-model=} {--remove} {--force}
```

If you want to `rebuild` for your Restful API model,

```shell
php artisan apitoolz:model Customer --table=customers --rebuild
```

## Remove Model

If you want to remove created model, you can using the `apitoolz:remove` Artisan command.

```shell
php artisan apitoolz:remove Product --model --force-detele
```

## License

The MIT License (\MIT). Please see [License File](LICENSE.md) for more information.
