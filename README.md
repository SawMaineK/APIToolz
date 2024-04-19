# API Toolz

APIToolz rapidly generates RESTful APIs within seconds based on a provided model, allowing you to seamlessly share your RESTful API documentation with frontend developers.

## Features

- Create database table migrations via Artisan Commands
- Generate Restful APIs with `Create Table SQL` via Artisan Commands
- Swagger API documentation
- Full-text search functionality
- API authentication/authorization support
- Relationship support between two models
- Configuration options for `[request body]` including `Validation, Cast[object, array], Full-text search enable, Fillable, Input Type(text, password, image/file upload, and more)`
- Configuration options for `[response body]` including `Casting, Show/Hide, Object, Array, and more`
- Application user onboarding features such as `User Register, Login, Forget Password, Verification(email, OTP, and Authenticator - coming soon), User Profile Update, Inactive/Logout Profile`
- Daily auto backup for code and database
- Request/Process/Response logging layer (Coming Soon)
- Export/Import model functionality via Artisan Commands

## Requirements

`apitoolz` requires at least PHP 8.2 and Laravel 11.

## Installation (with [Composer](https://getcomposer.org))

```shell
composer require sawmainek/apitoolz
```

After installing `sawmainek/apitoolz`, publish the APIToolz configuration file using the `vendor:publish` Artisan command. This command will publish the `apitoolz.php` configuration file to your application's `config` directory:

```shell
php artisan vendor:publish --provider="Sawmainek\Apitoolz\APIToolzServiceProvider" --tag="config"
```

Then, set the environment variables with your APIToolz `Purchase Key` and `Activated Key` credentials within your application's `.env` file:

```shell
APITOOLZ_HOST=https://apitoolz.com/api/v1/blender
APITOOLZ_PURCHASE_KEY=YOUR_PURCHASE_KEY
APITOOLZ_ACTIVATED_KEY=YOUR_ACTIVATED_KEY
```

If you don't have the `Purchase Key`, please purchase it from [Codecanyon](). Once you've obtained the `Purchase Key`, activate it to receive the `Activated Key` on our [APIToolz](https://apitoolz.com/apps/activation) platform.

Now that you've installed `sawmainek/apitoolz`, you must run the `install:api` command to complete the installation process:

```shell
php artisan install:api
```

**Note:** Additional verification may be required.

If you wish to customize views for `export Model` and more, use the following command:

```shell
php artisan vendor:publish --provider="Sawmainek\Apitoolz\APIToolzServiceProvider" --tag="views"
```

## Requirements Dependencies

Install the `laravel/scout` dependency for full-text search in your models:

```shell
composer require laravel/scout
```

After installing Scout, publish the Scout configuration file using the `vendor:publish` Artisan command. This command will publish the `scout.php` configuration file to your application's `config` directory:

```shell
php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

After installing Scout, install driver prerequisites:

```shell
composer require algolia/algoliasearch-client-php
```

Then, set the `SCOUT_DRIVER` environment variable, along with your Algolia `app_id` and `secret` credentials, within your application's `.env` file:

```shell
SCOUT_DRIVER=algolia
SCOUT_QUEUE=true
ALGOLIA_APP_ID=YOUR_ALGOLIA_APP_ID
ALGOLIA_SECRET=YOUR_ALGOLIA_SECRET
```

## Swagger Installation for API Document

For Swagger API documentation, run the following Artisan command:

```shell
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

You can then set `L5_SWAGGER_GENERATE_ALWAYS` to `true` in your `.env` file to automatically generate your documentation.

## Usage

You can generate your model using the `apitoolz:model` Artisan command:

```shell
php artisan apitoolz:model Product --table=products --soft-delete
```

You can also generate your model with `SQL format` as follows:

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

**Note:** The `--table=customers` and `--sql="CREATE TABLE 'customers' ..."` must match.

After generating, you can check your model's Restful API via the

 Swagger API document at [API Documentation](http://127.0.0.1:8000/api/documentation).

## Request Body Configuration

Configure the field-level configuration for the provided model:

```shell
php artisan apitoolz:request Sale --field=sale_date --validator="required|date|after:tomorrow" --searchable=false
```

For available option parameters for `request body configuration`:

```shell
php artisan apitoolz:request {model} {--field=} {--label=} {--input-type=} {--validator=} {--cast=} {--searchable=true/false} {--fillable=true/false} {--position=} {--upload-path=} {--upload-max-size=} {--upload-type=image/file} {--upload-multiple=false/false} {--reset}
```

If you want to reset the default field configuration:

```shell
php artisan apitoolz:request Sale --field=sale_date --reset
```

## Model Relationship

To add a relationship between two models (e.g., `belongsTo`, `hasOne`, `hasMany`), use the following commands:

```shell
// For belongsTo
php artisan apitoolz:relation Sale --title=customer --relation-model=Customer --relation-type=belongsTo --foreign-key=customer_id

// For hasOne
php artisan apitoolz:relation Customer --title=phone --relation-model=Phone --relation-type=hasOne
```

To remove an existing relation of the provided model:

```shell
php artisan apitoolz:relation Customer --title=phone --remove
```

For additional options for relationships:

```shell
apitoolz:relation {model} {--title=} {--relation-model=}  {--relation-type=belongsTo} {--foreign-key=} {--display-field=} {--sub-relation-model=} {--remove} {--force}
```

To `rebuild` your Restful API model:

```shell
php artisan apitoolz:model Customer --table=customers --rebuild
```

## Remove Model

To remove a created model, use the `apitoolz:remove` Artisan command:

```shell
php artisan apitoolz:remove Product --model --force-delete
```

## Export/Import Models

APIToolz allows you to export/import models using the `apitoolz:export|import` Artisan command.

#### Export Model

```shell
php artisan apitoolz:export --include-data
```

To export a model of provided name:

```shell
php artisan apitoolz:export --model=Customer --include-data
```

#### Import Model

```shell
php artisan apitoolz:import --file=your_file.zip
```

To import a mdoel of provided name without data:

```shell
php artisan apitoolz:import --file=your_file.zip --model=Customer --exclude-data
```

## License

The Commercial Software License.
