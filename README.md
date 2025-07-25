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
php artisan db:seed --class=APIToolzSeeder
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

### How can I generate a React frontend scaffold?

You can generate a fully configured React frontend using the `apitoolz:react-frontend` Artisan command. This command scaffolds a React app with options for Vite, Tailwind CSS, TypeScript, ESLint, Storybook, and AI-powered component generation.

#### Example Usage

To create a React frontend named `Frontend` in the default directory with a blue Tailwind theme and Vite config:

```shell
php artisan apitoolz:react-frontend Frontend --path=resources/js --theme=blue --vite --tailwind --typescript --eslint --storybook --force
```

#### Example from BRS file

To scaffold a TypeScript React app with Vite, Tailwind, ESLint, Storybook, and AI-generated layout from a BRS file:

```shell
php artisan apitoolz:react-frontend Frontend \
    --path=resources/js \
    --theme=teal \
    --vite \
    --tailwind \
    --typescript \
    --eslint \
    --storybook \
    --use-ai=resources/brs/layout.md \
    --force
```

#### Available Options

| Option           | Description                                                                                   |
|------------------|-----------------------------------------------------------------------------------------------|
| `{name}`         | Logical name of the React bundle (e.g. `Frontend`).                                           |
| `--path=`        | Destination base directory (default: `resources/js`).                                         |
| `--theme=`       | Tailwind primary color (`blue`, `teal`, `violet`, etc.).                                      |
| `--vite`         | Include Vite config and plugin.                                                               |
| `--tailwind`     | Include Tailwind CSS preset.                                                                  |
| `--typescript`   | Use TypeScript (.tsx entry + tsconfig.json).                                                  |
| `--eslint`       | Add ESLint, Prettier, and Tailwind class-sorting.                                             |
| `--storybook`    | Add Storybook 7 scaffold.                                                                     |
| `--use-ai=`      | Use AI to generate component layout from a BRS file (`.txt` or `.md` path).                   |
| `--rollback=`    | Remove current build and revert to previous count.                                            |
| `--force`        | Overwrite existing files.                                                                     |
| `--doc`          | Print documentation for the scaffold.                                                         |

This command streamlines React frontend setup, ensuring best practices and rapid development with modern tooling.

### How can I generate a model?

To generate a model, use the `apitoolz:model` Artisan command:

```shell
php artisan apitoolz:model Product --table=products --soft-delete
```

### Available Options for Model Generation

Below are the available options for the `apitoolz:model` Artisan command:

| Option                  | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `--update`              | Update an existing model without creating a new one.                       |
| `--table=`              | Specify the database table name for the model.                             |
| `--title=`              | Set the title or display name for the model.                               |
| `--desc=`               | Provide a description for the model.                                       |
| `--type=`               | Define the type of model (e.g., `basic`, `advanced`).                      |
| `--use-auth`            | Enable authentication support for the model.                              |
| `--use-roles=`          | Enable role-based access control for the model. Specify roles as a comma-separated list, e.g., `admin,user`. |
| `--use-policy`          | Apply user policy to the model (requires `user_id` field in the table).    |
| `--use-observer`       | Enable model observer functionality for lifecycle events.                   |
| `--use-hook=`           | Attach custom hooks to the model lifecycle events. Specify hook names as a comma-separated list, e.g., `handle,creating,updating,deleted`. |
| `--soft-delete`         | Enable soft delete functionality for the model.                           |
| `--sql=`                | Provide an SQL table definition to generate the model.                    |
| `--lock=`               | Lock specific components to prevent overwriting during regeneration. Options: `controller`, `model`, `request`, `resource`, `service`. |
| `--force`               | Force the operation without confirmation.                                 |
| `--use-ai`              | Use AI to build the model configuration automatically.                  |
| `--ask`                  | Provide optional input interactively during model generation.            |
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
| `--lookup-value=`       | The fields to display as the lookup value. You can specify multiple fields as a comma-separated list, e.g., `first_name,last_name`. |
| `--lookup-filter-key=`          | The key field for external lookup values (e.g., `category_id`).                    |
| `--lookup-dependency-key=` | Dependency key for cascading dropdowns.                                 |
| `--lookup-query=`       | Query for predefined options (e.g., `key:value|key2:value2`).              |
| `--select-multiple=`    | Allow multiple selections (`true` or `false`).                             |
| `--reset`               | Reset the field configuration to default.                                 |

## Response List Configuration
### How can I configure the response list for a model?

You can configure which fields are visible in the API response list for a model using the `apitoolz:response` Artisan command. This allows you to control field visibility, exportability, labels, and ordering in the response.

#### Example Usage

1. To set a field as visible and exportable in the response list:
    ```shell
    php artisan apitoolz:response Product --field=name --label="Product Name" --visible=true --export=true --position=1
    ```

2. To hide a field from the response list:
    ```shell
    php artisan apitoolz:response Product --field=internal_notes --visible=false
    ```

3. To reset a field's response configuration to default:
    ```shell
    php artisan apitoolz:response Product --field=price --reset
    ```

#### Available Option Parameters for Response List Configuration

| Parameter      | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `--field=`     | The name of the field to configure.                                         |
| `--label=`     | The label to display for the field in the response.                         |
| `--visible=`   | Set field visibility in the response list (`true` or `false`).              |
| `--export=`    | Set field exportability (`true` or `false`).                                |
| `--position=`  | The position/order of the field in the response list.                       |
| `--width=`    | Set the display width for the field in the response list (e.g., `100px`, `20%`).           |
| `--only-roles=`| Restrict field visibility in the response list to specific roles. Specify roles as a comma-separated list, e.g., `admin,user`. |
| `--reset`      | Reset the field's response configuration to default.                        |

This command helps you customize the API response structure for each model, ensuring only the desired fields are included and properly formatted.

## Model Summary Report
### How can I create a model summary report?

You can create summary reports for your models using the `apitoolz:summary` Artisan command. This command allows you to define summary cards or charts (such as counts, sums, averages, and grouped statistics) that can be displayed in your API dashboard or UI.

#### Example Usage

1. To create a simple count summary for a model:
    ```shell
    php artisan apitoolz:summary Product --title="Total Products" --type=kpi --icon=box --method=count
    ```

2. To create a sum summary for a specific column:
    ```shell
    php artisan apitoolz:summary Sale --title="Total Sales Amount" --type=kpi --icon=dollar-sign --method=sum --column=amount
    ```

3. To create a grouped bar chart summary:
    ```shell
    php artisan apitoolz:summary Order --title="Orders by Status" --type=chart --chart-type=bar --group-by=status --aggregate=count
    ```

4. To remove a summary:
    ```shell
    php artisan apitoolz:summary Product --title="Total Products" --remove
    ```

5. To force remove a summary without confirmation:
    ```shell
    php artisan apitoolz:summary Product --title="Total Products" --remove --force
    ```

6. To generate documentation for the summary:
    ```shell
    php artisan apitoolz:summary Product --doc
    ```

#### Available Options for Model Summary

| Option             | Description                                                                                   |
|--------------------|-----------------------------------------------------------------------------------------------|
| `{model}`          | The model name for which to create the summary.                                               |
| `--title=`         | The display title for the summary.                                              |
| `--type=`          | The type of summary (`kpi` or `chart` or `progress`).                                                      |
| `--icon=`          | The icon to display for the summary card (e.g., `box`, `dollar-sign`).                        |
| `--method=`        | The summary method (`count`, `sum`, `avg`, `max`, `min`).                                     |
| `--column=`        | The column to aggregate (required for `sum`, `avg`, etc.).                                    |
| `--chart-type=`    | The chart type for visual summaries (`bar`, `pie`, `line`, etc.).                             |
| `--group-by=`      | The column to group results by (for grouped charts).                                          |
| `--aggregate=`     | The aggregate function to use in grouped summaries (`count`, `sum`, etc.).                    |
| `--where=`         | Add a custom filter condition to the summary query. Supports operators and functions:  
    - `status=success` or `status:success` → `status = 'success'`  
    - `status:in(pending,paid)` → `status IN ('pending', 'paid')`  
    - `created_at:>=2025-01-01` → `created_at >= '2025-01-01'`  
    - `email:notnull` → `email IS NOT NULL`  
    - `name:like(john)` → `name LIKE '%john%'`  
| `--limit=`         | Limit the number of groups or results displayed.                                              |
| `--value-method=`  | Custom method to calculate the value.                                                         |
| `--value-column=`  | Custom column for value calculation.                                                          |
| `--max-method=`    | Method to calculate the maximum value.                                                        |
| `--unit=`          | Unit to display with the summary value (e.g., `USD`, `items`).                               |
| `--remove`         | Remove the specified summary.                                                                 |
| `--list`          | List all existing summaries for the specified model.                                             |
| `--force`          | Force the removal operation without confirmation.                                             |
| `--doc`            | Generate documentation for the summary configuration.                                         |

These options allow you to create flexible and informative summary reports for your API models, enhancing your application's dashboard and analytics capabilities.

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
| `--display-field=`      | The fields to display for the related model. You can specify multiple fields as a comma-separated list, e.g., `first_name,last_name`. |
| `--remove`              | Remove the specified relationship.                                         |
| `--list`               | List all existing relationships for the specified model.                         |
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
    php artisan apitoolz:filter Product --title=category --filter-type=select --filter-model=Category --filter-key=category_id --filter-label=name
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

5. To define a filter with custom value and label fields:
    ```shell
    php artisan apitoolz:filter Product --title=brand --filter-type=select --filter-model=Brand --filter-key=brand_id --filter-value=id --filter-label=name
    ```

6. To remove an existing filter:
    ```shell
    php artisan apitoolz:filter Product --title=category --remove
    ```

7. To force remove a filter without confirmation:
    ```shell
    php artisan apitoolz:filter Order --title=status --remove --force
    ```

### Available Options for Filters

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `--title=`              | The name of the filter.                                                    |
| `--filter-type=`        | The type of filter (`select`, `checkbox`, `radio`).                        |
| `--filter-model=`       | The model to use for external filter values.                               |
| `--filter-query=`       | Query for predefined filter options (e.g., `key:value|key2:value2`).       |
| `--filter-key=`         | The key field for the filter (e.g., `id`).                                 |
| `--filter-value=`       | The value field for the filter option (used with external models).          |
| `--filter-lable=`       | The fields to display for the filter options. You can specify multiple fields as a comma-separated list, e.g., `first_name,last_name`. |
| `--remove`              | Remove the specified filter.                                               |
| `--list`               | List all existing filters for the specified model.                                 |
| `--force`               | Force the removal operation without requiring confirmation.                |

## Rebuild/Remove Model

### How can I rebuild or remove a RESTful API model?

To rebuild a specific RESTful API model:

```shell
php artisan apitoolz:rebuild --model=Customer
```

To rebuild all RESTful API models:

```shell
php artisan apitoolz:rebuild --all
```

To remove a specific RESTful API model (without deleting its table):

```shell
php artisan apitoolz:model Customer --remove
```

To remove a model and its database table:

```shell
php artisan apitoolz:model Customer --remove --remove-table
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

## How to Integrate with a Custom SMS API?

To integrate a custom SMS API with APIToolz, follow these steps:

### Step 1: Implement the `CustomSmsService`

Create a custom SMS sender class in your application by implementing the `CustomSmsService`. Below is an example:

```php
// app/Services/CustomSmsService.php
namespace App\Services;

use Sawmainek\Apitoolz\Contracts\SmsSenderInterface;
use Illuminate\Support\Facades\Log;

class CustomSmsService implements SmsSenderInterface
{
    public function send(string $to, string $message): void
    {
        // Use your preferred SMS provider (e.g., Twilio, ClickSend, etc.)
        // Example log output for testing
        Log::info("Sending SMS to {$to}: {$message}");

        // You can integrate your SMS provider's API here
    }
}
```

### Step 2: Bind the Interface to Your Implementation

In your `AppServiceProvider`, bind the `CustomSmsService` to your custom implementation and extend the notification channel for SMS.

```php
// app/Providers/AppServiceProvider.php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Sawmainek\Apitoolz\Contracts\SmsSenderInterface;
use App\Services\CustomSmsService;
use Sawmainek\Apitoolz\Notifications\Channels\SmsChannel;
use Illuminate\Support\Facades\Notification;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Bind the SmsSenderInterface to the CustomSmsService implementation
        $this->app->bind(SmsSenderInterface::class, CustomSmsService::class);
    }

    public function boot()
    {
        // Extend the notification system to include the SMS channel
        Notification::extend('sms', function ($app) {
            return new SmsChannel($app->make(SmsSenderInterface::class));
        });
    }
}
```

### Step 3: Test Your Integration

Once the above steps are complete, you can test your SMS integration by sending notifications through the `sms` channel. Ensure that your custom SMS provider's API is correctly configured in the `CustomSmsService` class.

This setup allows you to seamlessly integrate any SMS provider of your choice into APIToolz.

## How to Implement Model Observers for the User?
### Define Observer Methods
Open the generated file and define the lifecycle hooks you want to handle:
```php
namespace App\Observers;

use Sawmainek\Apitoolz\Models\User;
use Illuminate\Support\Facades\Log;
//use App\Jobs\NotifyUserUpdateJob;

class UserObserver
{
    public function creating(User $user)
    {
        Log::info('Before creating user', ['data' => $user->toArray()]);
        // $user->status = $user->status ?? 'pending'; // Set default status
    }

    public function created(User $user)
    {
        Log::info('After creating user', ['id' => $user->id]);
        // dispatch(new NotifyUserUpdateJob($user)); // Trigger async job
    }

    public function updating(User $user)
    {
        Log::info('Before updating user', ['id' => $user->id]);
    }

    public function updated(User $user)
    {
        Log::info('After updating user', ['id' => $user->id]);
    }

    public function deleting(User $user)
    {
        Log::info('Before deleting user', ['id' => $user->id]);
    }

    public function deleted(User $user)
    {
        Log::info('After deleting user', ['id' => $user->id]);
    }

    public function restoring(User $user)
    {
        Log::info('Before restoring user', ['id' => $user->id]);
    }

    public function restored(User $user)
    {
        Log::info('After restoring user', ['id' => $user->id]);
    }
}
```
### Create an Async Job (Optional) 
To handle asynchronous tasks, create a job:

```php
namespace App\Jobs;

use Sawmainek\Apitoolz\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyUserUpdateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function handle()
    {
        Log::info('Async notification triggered for user', ['id' => $this->user->id]);
        // Add notification logic here
    }
}
```

This setup ensures that your model's lifecycle events are handled efficiently, with support for asynchronous processing when needed.

To process queued jobs, you can use the following command:

```shell
php artisan queue:work
```

This command will start processing jobs from the queue. Ensure that your queue driver is correctly configured in the `.env` file (e.g., `QUEUE_CONNECTION=database` for database queues). You can also specify additional options, such as the queue name or the number of jobs to process.

For example, to process jobs from a specific queue:
```shell
php artisan queue:work --queue=high
```

To run the queue worker as a daemon (recommended for production):
```shell
php artisan queue:work --daemon
```

For more details, refer to the [Laravel Queue Documentation](https://laravel.com/docs/queues).

## License

The Commercial Software License.
