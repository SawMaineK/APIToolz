# API Toolz

APIToolz rapidly generates RESTful APIs within seconds based on a provided model, allowing you to seamlessly share your RESTful API documentation with frontend developers.

## Features

- Create your solution with AI
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
- Request/Database Query/Response logging layer
- Export/Import model functionality via Artisan Commands

## Requirements

`AP IToolz` requires at least PHP 8.2 and Laravel 11.

## Installation (with [Composer](https://getcomposer.org))

```shell
composer require sawmainek/apitoolz
```

## Activation

After installing, Activate the APIToolz using the `apitoolz:activate` Artisan command with your `purchase key` and `dns`:

```shell
php artisan apitoolz:activate --client-dns=http://127.0.0.1:8000 --purchase-key="demo"
```

If you don't have the `Purchase Key`, please purchase it from [Codecanyon]().


## Usages

Now, Create your solution with AI quickly. then publish your solution.

```shell
php artisan apitoolz:ai --requirement="For POS system, include sale order, and cashier"
```

You can generate your model using the `apitoolz:model` Artisan command:

```shell
php artisan apitoolz:model Product --table=products --soft-delete
```

If you wish to create model with user `policy`, you can use the `--use-policy` Artisan command.
**Note**: The model's table have field `user_id`.

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

## Creating Datatable

If you wish to create only database table, you can using the `apitoolz:datatable` Artisan command.

```shell
php artisan apitoolz:datatable customers --soft-delete
```

To remove the database table:

```shell
php artisan apitoolz:datatable customers --remove
```

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
php artisan apitoolz:model Customer --rebuild
```

To `remove` your model:

```shell
php artisan apitoolz:model Product --remove --remove-table
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
