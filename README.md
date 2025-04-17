# API Toolz

APIToolz is a powerful tool for rapidly generating RESTful APIs in seconds. It simplifies backend development by automating API creation, database migrations, and documentation, making it easier to collaborate with frontend developers.

## Key Features

- **AI-Powered Solutions**: Generate solutions using AI for faster development.
- **Database Table Management**: Create and manage database table migrations via Artisan commands.
- **RESTful API Generation**: Build APIs directly from SQL table definitions or models.
- **Swagger Documentation**: Automatically generate and share API documentation.
- **Full-Text Search**: Enable advanced search functionality for your APIs.
- **Authentication & Authorization**: Built-in support for secure API access.
- **Model Relationships**: Define and manage relationships between models.
- **Request Body Configuration**: Customize validation, casting (object/array), input types (text, password, file upload, etc.), and more.
- **Response Body Configuration**: Control casting, visibility, and formatting of API responses.
- **User Management**: Includes user registration, login, password recovery, email/OTP verification, and profile updates.
- **Automated Backups**: Daily backups for both code and database.
- **Logging**: Comprehensive logging for requests, database queries, and responses.
- **Export/Import Models**: Easily export or import models and their data via Artisan commands.


## Requirements

`APIToolz` requires the following:

- PHP 8.2 or higher
- Laravel 12

## Installation

Install `APIToolz` using [Composer](https://getcomposer.org):

```shell
composer require sawmainek/apitoolz
```

### Publish Vendor Files and Migrate Database

Run the following commands to publish vendor files and migrate the database:

```shell
php artisan migrate
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=RolePermissionSeeder
php artisan vendor:publish --tag=apitoolz-config
```

### Enable APIToolz UI Mode (Optional)

To enable the APIToolz UI mode, publish the UI assets:

```shell
php artisan vendor:publish --tag=apitoolz-ui
```

### Update `.env` File

Add or update the following environment variables in your `.env` file:

```shell
SCOUT_DRIVER=database
SCOUT_QUEUE=true
ALGOLIA_APP_ID=
ALGOLIA_SECRET=
```

## Activation

Activate `APIToolz` using the `apitoolz:activate` Artisan command with your `purchase key` and `DNS`:

```shell
php artisan apitoolz:activate
```

If you don't have a `Purchase Key`, you can purchase one from [Codecanyon](https://codecanyon.net).


## Usages

### How can I create a solution with AI?

You can quickly create a solution using AI and then publish it:

```shell
php artisan apitoolz:ai --requirement="For POS system, include sale order, and cashier"
```

### How can I generate a model?

To generate a model, use the `apitoolz:model` Artisan command:

```shell
php artisan apitoolz:model Product --table=products --soft-delete
```

### Available Options for Model Generation

Below are the available options for the `apitoolz:model` Artisan command:

| Option                  | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `--table=`              | Specify the database table name for the model.                             |
| `--type=`               | Define the type of model (e.g., `basic`, `advanced`).                      |
| `--use-auth`            | Enable authentication support for the model.                              |
| `--use-roles=`           | Enable role-based access control for the model. Specify roles as a comma-separated list, e.g., `admin,user`. |
| `--use-policy`          | Apply user policy to the model (requires `user_id` field in the table).    |
| `--soft-delete`         | Enable soft delete functionality for the model.                           |
| `--sql=`                | Provide an SQL table definition to generate the model.                    |
| `--force`               | Force the operation without confirmation.                                 |
| `--rebuild`             | Rebuild the model and its associated API.                                 |
| `--remove`              | Remove the model without deleting its database table.                     |
| `--remove-table`        | Remove the model along with its database table.                           |
| `--force-delete`        | Force delete the model and its table without confirmation.                |

### Example Usage

1. To create a model with a specific table:
    ```shell
    php artisan apitoolz:model Product --table=products
    ```

2. To create a model with authentication and role-based access control:
    ```shell
    php artisan apitoolz:model Order --table=orders --use-auth --use-roles=admin,user
    ```

3. To rebuild an existing model:
    ```shell
    php artisan apitoolz:model Customer --rebuild
    ```

4. To remove a model and its table:
    ```shell
    php artisan apitoolz:model Product --remove --remove-table
    ```

5. To force delete a model and its table:
    ```shell
    php artisan apitoolz:model Sale --force-delete
    ```

### Can I create a model with user policy?

Yes, you can create a model with user `policy` using the `--use-policy` flag.  
**Note:** The model's table must include a `user_id` field.

```shell
php artisan apitoolz:model Product --table=products --soft-delete --use-policy
```

### How can I generate a model using SQL format?

You can generate a model with an SQL table definition as follows:

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

**Note:** The `--table=customers` and the table name in the `--sql` statement must match.

### Where can I view the generated model's API documentation?

After generating a model, you can view its RESTful API documentation via Swagger at:  
[API Documentation](http://127.0.0.1:8000/api/documentation)

## Creating Datatable

### How can I create a database table only?

You can create a database table using the `apitoolz:datatable` Artisan command:

```shell
php artisan apitoolz:datatable customers --soft-delete
```

### How can I remove a database table?

To remove a database table, use the following command:

```shell
php artisan apitoolz:datatable customers --remove
```

### How can I add, update, or drop fields in a table?

You can modify a table by adding, updating, or dropping fields using the respective options: `--add-field=`, `--update-field=`, and `--drop-field=`.

#### Example: Adding a field
To add a new field to a table:
```shell
php artisan apitoolz:datatable customers --add-field=gender --type=string --field-after=email --not-null --default=other
```

#### Example: Updating a field
To update an existing field:
```shell
php artisan apitoolz:datatable customers --update-field=phone_number --type=string --not-null
```

#### Example: Dropping a field
To drop a field from a table:
```shell
php artisan apitoolz:datatable customers --drop-field=address
```

### Available Options for Datatable Configuration

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `--add-field=`          | Add a new field to the table.                                               |
| `--update-field=`       | Update an existing field in the table.                                      |
| `--drop-field=`         | Remove a field from the table.                                              |
| `--type=`               | Specify the data type of the field (e.g., `string`, `integer`, etc.).       |
| `--field-after=`        | Position the new field after an existing field.                             |
| `--not-null`            | Make the field non-nullable.                                                |
| `--default=`            | Set a default value for the field.                                          |
| `--soft-delete`         | Enable soft delete functionality for the table.                             |

### Frequently Asked Questions

#### 1. Can I add multiple fields at once?
No, you need to run the `--add-field` option separately for each field.

#### 2. What happens if I drop a field that contains data?
The field and its data will be permanently removed, so proceed with caution.

#### 3. Can I reorder fields in a table?
Yes, you can use the `--field-after=` option to position a new field after an existing one.

#### 4. Is it possible to enable soft deletes for an existing table?
No, the `--soft-delete` option is only applicable when creating a new table.

## Request Body Configuration

### How can I configure field-level settings for a model?

You can configure the field-level settings for a model using the `apitoolz:request` Artisan command. Below are some examples:

1. To configure a field with validation rules and disable searchability:
    ```shell
    php artisan apitoolz:request Sale --field=sale_date --validator="required|date|after:tomorrow" --searchable=false
    ```

2. To configure a field as a dropdown with external lookup values:
    ```shell
    php artisan apitoolz:request Product --field=category_id --input-type=select --opt-type=external --lookup-model=category --lookup-value=name
    ```

3. To configure a field as a datalist with predefined options:
    ```shell
    php artisan apitoolz:request Incident --field=type --input-type=select --opt-type=datalist --lookup-query='missing:Missing|help:Help' --label='Choose Type' --position=0
    ```

4. To configure a field with criteria-based visibility:
    ```shell
    php artisan apitoolz:request Incident --field=description --criteria-key=type --criteria-value=help --position=1
    ```

5. Reset a field configuration:
    ```shell
    php artisan apitoolz:request Sale --field=sale_date --reset
    ```


### Available Option Parameters for Request Body Configuration

Below are the available option parameters for configuring the request body:

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `--field=`              | The name of the field to configure.                                        |
| `--label=`              | The label for the field.                                                   |
| `--input-type=`         | The input type (e.g., `text`, `password`, `select`, `file`, etc.).         |
| `--validator=`          | Validation rules for the field (e.g., `required`, `date`, etc.).           |
| `--cast=`               | Data type casting for the field (e.g., `object`, `array`).                 |
| `--searchable=`         | Enable or disable searchability (`true` or `false`).                       |
| `--fillable=`           | Enable or disable fillable property (`true` or `false`).                   |
| `--position=`           | The position of the field in the form.                                     |
| `--upload-path=`        | Path for file uploads.                                                     |
| `--upload-max-size=`    | Maximum file size for uploads.                                             |
| `--upload-type=`        | Type of upload (`image` or `file`).                                        |
| `--upload-multiple=`    | Allow multiple file uploads (`true` or `false`).                           |
| `--opt-type=`           | Option type (`select` or `datalist`).                                      |
| `--lookup-model=`       | The model to use for external lookup values.                               |
| `--lookup-value=`       | The field to display as the lookup value.                                  |
| `--lookup-dependency-key=` | Dependency key for cascading dropdowns.                                 |
| `--lookup-query=`       | Query for predefined options (e.g., `key:value|key2:value2`).              |
| `--select-multiple=`    | Allow multiple selections (`true` or `false`).                             |
| `--reset`               | Reset the field configuration to default.                                 |


## Model Relationship

### How can I define relationships between models?

You can define relationships between models (e.g., `belongsTo`, `hasOne`, `hasMany`) using the `apitoolz:relation` Artisan command. Below are some examples:

1. To define a `belongsTo` relationship:
    ```shell
    php artisan apitoolz:relation Sale --title=customer --relation-model=Customer --relation-type=belongsTo --foreign-key=customer_id
    ```

2. To define a `hasOne` relationship:
    ```shell
    php artisan apitoolz:relation Customer --title=phone --relation-model=Phone --relation-type=hasOne
    ```

3. To remove an existing relationship:
    ```shell
    php artisan apitoolz:relation Customer --title=phone --remove
    ```

### What additional options are available for relationships?

Below are the available options for configuring relationships:

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `--title=`              | The name of the relationship.                                              |
| `--relation-model=`     | The related model for the relationship.                                    |
| `--relation-type=`      | The type of relationship (`belongsTo`, `hasOne`, `hasMany`, etc.).         |
| `--foreign-key=`        | The foreign key for the relationship.                                      |
| `--display-field=`      | The field to display for the related model.                                |
| `--remove`              | Remove the specified relationship.                                         |
| `--force`               | Force the removal operation without requiring confirmation.                |

### Example Usage

To define a `hasMany` relationship with additional options:
```shell
php artisan apitoolz:relation Customer --title=orders --relation-model=Order --relation-type=hasMany --display-field=order_number
```

To remove a relationship with force:
```shell
php artisan apitoolz:relation Customer --title=orders --remove --force
```

## Model Filters

### How can I define filters for a model?

You can define filters for a model using the `apitoolz:filter` Artisan command. Filters allow you to apply specific criteria to model queries, enabling more dynamic and customizable data retrieval.

Below are some examples:

1. To define a filter with a specific type:
    ```shell
    php artisan apitoolz:filter Product --title=category --filter-type=select --filter-model=Category --filter-key=category_id --display-field=name
    ```

2. To define a filter with a custom query:
    ```shell
    php artisan apitoolz:filter Order --title=status --filter-type=select --filter-query='pending:Pending|completed:Completed|canceled:Canceled' --filter-key=status
    ```

3. To define a filter with a radio type:
    ```shell
    php artisan apitoolz:filter Product --title=availability --filter-type=radio --filter-query='in_stock:In Stock|out_of_stock:Out of Stock' --filter-key=availability
    ```

4. To define a filter with a checkbox type:
    ```shell
    php artisan apitoolz:filter Product --title=published --filter-type=checkbox --filter-query='Is Active' --filter-key=published
    ```

5. To remove an existing filter:
    ```shell
    php artisan apitoolz:filter Product --title=category --remove
    ```

6. To force remove a filter without confirmation:
    ```shell
    php artisan apitoolz:filter Order --title=status --remove --force
    ```

### Available Options for Filters

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `--title=`              | The name of the filter.                                                    |
| `--filter-type=`        | The type of filter (`select`, `checkbox`, radio).                         |
| `--filter-model=`       | The model to use for external filter values.                               |
| `--filter-query=`       | Query for predefined filter options (e.g., `key:value|key2:value2`).       |
| `--filter-key=`         | The key field for the filter (e.g., `id`).                                 |
| `--display-field=`      | The field to display for the filter options.                               |
| `--remove`              | Remove the specified filter.                                               |
| `--force`               | Force the removal operation without requiring confirmation.                |

## Rebuild/Remove Model

### How can I rebuild or remove a Restful API model?

To rebuild your Restful API model:

```shell
php artisan apitoolz:model Customer --rebuild
```
To remove your model along with its database table:

```shell
php artisan apitoolz:model Product --remove --remove-table
```

## Export/Import Models

### How can I export models?

APIToolz allows you to export models using the `apitoolz:export` Artisan command. Below are some examples:

1. To export all models along with their data:
    ```shell
    php artisan apitoolz:export --include-data
    ```

2. To export a specific model by name:
    ```shell
    php artisan apitoolz:export --model=Customer --include-data
    ```

### How can I import models?

You can import models using the `apitoolz:import` Artisan command. Below are some examples:

1. To import a model from a file:
    ```shell
    php artisan apitoolz:import --file=your_file.zip
    ```

2. To import a specific model by name without including its data:
    ```shell
    php artisan apitoolz:import --file=your_file.zip --model=Customer --exclude-data
    ```

### Frequently Asked Questions

#### 1. Can I export models without including their data?
Yes, you can omit the `--include-data` flag to export only the model structure.

#### 2. What file format is required for importing models?
The file must be in `.zip` format.

#### 3. Can I import multiple models at once?
Yes, if the `.zip` file contains multiple models, they will all be imported unless specified otherwise.

#### 4. How do I ensure data integrity during import/export?
Always verify the file and model names before executing the commands to avoid conflicts or data loss.

## License

The Commercial Software License.
