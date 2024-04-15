# APIToolz

APIToolz expeditiously gennerates RESTful APIs within seconds based on a provided model.


## Requirements

`apitoolz` requires at least PHP 8.2 and Laravel 11.

## Installation (with [Composer](https://getcomposer.org))

```shell
composer require sawmainek/apitoolz
```

After you installed `sawmainek/apitoolz`, you must install `install:api` and complete the installation steps.

```shell
php artisan install:api
```

If you want to customizable view for export, and etc..

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

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
