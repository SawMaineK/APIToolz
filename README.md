# API Toolz

APIToolz expeditiously gennerates RESTful APIs within seconds based on a provided model.

## Features

- Create database table migration via Artisan Commands
- Create Restful API via Artisan Commands
- Remove Restful API model via Artisan Commands
- Swagger API documentation
- Full-text search
- API authentication/authorization
- Support relationship between two models
- Support `[request body]` configuration for `Validation, Cast[object, array], Full-text search enable, Fillable, Input Type(text, password, image/file upload, and etc..)` and more.
- Support `[response body]` configuration for `Casting, Show/Hide, Object, Array, and etc...` and more`.
- Application user onboarding `User Register, Login, Forget Password, Verification(email, OTP and Authenticator - coming soon), User Profile Update, Inactive/Logout Profile`.
- Daily auto backup for code and database
- Request/Process/Response logging layer `Coming Soon`
- Export/Import model `Coming Soon` via Artisan Commands

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
Then, set the environment variable with your APIToolz's `Purchase Key` and `Activated Key` credentials within your application's .env file:

```shell
APITOOLZ_HOST=https://apitoolz.com/api/v1/blender
APITOOLZ_PURCHASE_KEY=YOUR_PURCHASE_KEY
APITOOLZ_ACTIVATED_KEY=YOUR_ACTIVATED_KEY
```

If you don't have the `Purchase Key`, Please purchase from [Codecanyon](). After you have got `Purchase Key`, Please activate to get the `Activated Key` on our [APIToolz](https://apitoolz.com/apps/activation).

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
[API Documentation](http://127.0.0.1:8000/api/documentation)

## Request Body Configuration

You can configure for provided model's field level configuration.

```shell
php artisan apitoolz:request Sale --field=sale_date --validator="required|date|after:tomorrow" --searchable=false
```

If you want to reset defalut field configuration,

```shell
php artisan apitoolz:request Sale --field=sale_date --reset
```

## Model Relationship

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

The Commercial Software License.
