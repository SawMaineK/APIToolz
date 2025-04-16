import { Accordion, AccordionItem } from '@/components/accordion';
import MarkdownViewer from '@/components/markdown/MarkdownViewer';

interface IFaqItem {
  title: string;
  text: string;
}
interface IFaqItems extends Array<IFaqItem> {}

const MiscFaq = () => {
  const items: IFaqItems = [
    {
      title: 'How can I create a model?',
      text: `
To create a model, use the \`apitoolz:model\` Artisan command:

\`\`\`shell
php artisan apitoolz:model Product --table=products --soft-delete
\`\`\`

### Available Options for Model Generation

Below are the available options for the \`apitoolz:model\` Artisan command:

| Option                  | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| \`--table=\`              | Specify the database table name for the model.                             |
| \`--type=\`               | Define the type of model (e.g., \`basic\`, \`advanced\`).                      |
| \`--use-auth\`            | Enable authentication support for the model.                              |
| \`--use-roles=\`           | Enable role-based access control for the model. Specify roles as a comma-separated list, e.g., \`admin,user\`. |
| \`--use-policy\`          | Apply user policy to the model (requires \`user_id\` field in the table).    |
| \`--soft-delete\`         | Enable soft delete functionality for the model.                           |
| \`--sql=\`                | Provide an SQL table definition to generate the model.                    |
| \`--force\`               | Force the operation without confirmation.                                 |
| \`--rebuild\`             | Rebuild the model and its associated API.                                 |
| \`--remove\`              | Remove the model without deleting its database table.                     |
| \`--remove-table\`        | Remove the model along with its database table.                           |
| \`--force-delete\`        | Force delete the model and its table without confirmation.                |

`
    },
    {
      title: 'Can I create a model with user policy?',
      text: `
Yes, you can create a model with user \`policy\` using the \`--use-policy\` flag.
**Note:** The model's table must include a \`user_id\` field.

\`\`\`shell
php artisan apitoolz:model Product --table=products --soft-delete --use-policy
\`\`\`
`
    },
    {
      title: 'Can I create with model with role-based access?',
      text: `
To create a model with authentication and role-based access control:
\`\`\`shell
php artisan apitoolz:model Order --table=orders --use-auth --use-roles=admin,user
\`\`\`
`
    },
    {
      title: 'How do I create a model with table SQL format?',
      text: `
\`\`\`php
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
\`\`\`

This command will create a new model called \`Customer\` with the specified table name and soft delete functionality. The SQL command provided will be executed to create the table in the database.

**Note:** The \`--table=customers\` and \`--sql="CREATE TABLE 'customers' ..."\` must match.
`
    },
    {
      title: 'How can I create a database table only?',
      text: `
You can create a database table using the \`apitoolz:datatable\` Artisan command:

\`\`\`shell
php artisan apitoolz:datatable customers --soft-delete
\`\`\`
`
    },
    {
      title: 'How can I remove a database table?',
      text: `
To remove a database table, use the following command:

\`\`\`shell
php artisan apitoolz:datatable customers --remove
\`\`\`
`
    },
    {
      title: 'How can I add, update, or drop fields in a table?',
      text: `
You can modify a table by adding, updating, or dropping fields using the respective options: \`--add-field=\`, \`--update-field=\`, and \`--drop-field=\`.

#### Example: Adding a field
To add a new field to a table:
\`\`\`shell
php artisan apitoolz:datatable customers \\
    --add-field=gender \\
    --type=string \\
    --field-after=email \\
    --not-null \\
    --default=other
\`\`\`

#### Example: Updating a field
To update an existing field:
\`\`\`shell
php artisan apitoolz:datatable customers \\
    --update-field=phone_number \\
    --type=string \\
    --not-null
\`\`\`

#### Example: Dropping a field
To drop a field from a table:
\`\`\`shell
php artisan apitoolz:datatable customers --drop-field=address
\`\`\`

### Available Options for Datatable Configuration

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| \`--add-field=\`          | Add a new field to the table.                                               |
| \`--update-field=\`       | Update an existing field in the table.                                      |
| \`--drop-field=\`         | Remove a field from the table.                                              |
| \`--type=\`               | Specify the data type of the field (e.g., \`string\`, \`integer\`, etc.).       |
| \`--field-after=\`        | Position the new field after an existing field.                             |
| \`--not-null\`            | Make the field non-nullable.                                                |
| \`--default=\`            | Set a default value for the field.                                          |
| \`--soft-delete\`         | Enable soft delete functionality for the table.                             |

### Frequently Asked Questions

#### 1. Can I add multiple fields at once?
No, you need to run the \`--add-field\` option separately for each field.

#### 2. What happens if I drop a field that contains data?
The field and its data will be permanently removed, so proceed with caution.

#### 3. Can I reorder fields in a table?
Yes, you can use the \`--field-after=\` option to position a new field after an existing one.

#### 4. Is it possible to enable soft deletes for an existing table?
No, the \`--soft-delete\` option is only applicable when creating a new table.

`
    },
    {
      title: 'How can I configure field-level settings for a model?',
      text: `
You can configure the field-level settings for a model using the \`apitoolz:request\` Artisan command. Below are some examples:

1. To configure a field with validation rules and disable searchability:
    \`\`\`shell
    php artisan apitoolz:request Sale \\
    --field=sale_date \\
    --validator="required|date|after:tomorrow" \\
    --searchable=false
    \`\`\`

2. To configure a field as a dropdown with external lookup values:
    \`\`\`shell
    php artisan apitoolz:request Product \\
    --field=category_id \\
    --input-type=select \\
    --opt-type=external \\
    --lookup-model=category \\
    --lookup-value=name \\
    --label='Choose Category'
    \`\`\`

3. To configure a field as a datalist with predefined options:
    \`\`\`shell
    php artisan apitoolz:request Product \\
    --field=type \\
    --input-type=select \\
    --opt-type=datalist \\
    --lookup-query="in-house:In-House|out-source:Out-Source" \\
    --label='Choose Type'
    \`\`\`

4. To configure a field with criteria-based visibility:
    \`\`\`shell
    php artisan apitoolz:request Product \\
    --field=qty \\
    --criteria-key=type \\
    --criteria-value=in-house \\
    \`\`\`

If you want to reset the default field configuration:

\`\`\`shell
php artisan apitoolz:request Sale --field=sale_date --reset
\`\`\`

### Available Option Parameters for Request Body Configuration

Below are the available option parameters for configuring the request body:

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| \`--field=\`              | The name of the field to configure.                                        |
| \`--label=\`              | The label for the field.                                                   |
| \`--input-type=\`         | The input type (e.g., \`text\`, \`password\`, \`select\`, \`file\`, etc.).         |
| \`--validator=\`          | Validation rules for the field (e.g., \`required\`, \`date\`, etc.).           |
| \`--cast=\`               | Data type casting for the field (e.g., \`object\`, \`array\`).                 |
| \`--searchable=\`         | Enable or disable searchability (\`true\` or \`false\`).                       |
| \`--fillable=\`           | Enable or disable fillable property (\`true\` or \`false\`).                   |
| \`--position=\`           | The position of the field in the form.                                     |
| \`--upload-path=\`        | Path for file uploads.                                                     |
| \`--upload-max-size=\`    | Maximum file size for uploads.                                             |
| \`--upload-type=\`        | Type of upload (\`image\` or \`file\`).                                        |
| \`--upload-multiple=\`    | Allow multiple file uploads (\`true\` or \`false\`).                           |
| \`--opt-type=\`           | Option type (\`select\` or \`datalist\`).                                      |
| \`--lookup-model=\`       | The model to use for external lookup values.                               |
| \`--lookup-value=\`       | The field to display as the lookup value.                                  |
| \`--lookup-dependency-key=\` | Dependency key for cascading dropdowns.                                 |
| \`--lookup-query=\`       | Query for predefined options (e.g., \`key:value|key2:value2\`).              |
| \`--select-multiple=\`    | Allow multiple selections (\`true\` or \`false\`).                             |
| \`--reset\`               | Reset the field configuration to default.

`
    },
    {
      title: 'How can I define relationships between models?',
      text: `
You can define relationships between models (e.g., \`belongsTo\`, \`hasOne\`, \`hasMany\`) using the \`apitoolz:relation\` Artisan command. Below are some examples:

1. To define a \`belongsTo\` relationship:
    \`\`\`shell
    php artisan apitoolz:relation Sale \\
    --title=customer \\
    --relation-model=Customer \\
    --relation-type=belongsTo \\
    --foreign-key=customer_id
    \`\`\`

2. To define a \`hasOne\` relationship:
    \`\`\`shell
    php artisan apitoolz:relation Customer \\
    --title=phone \\
    --relation-model=Phone \\
    --relation-type=hasOne
    \`\`\`

3. To define a \`hasMany\` relationship with additional options:
    \`\`\`shell
    php artisan apitoolz:relation Customer \\
    --title=orders \\
    --relation-model=Order \\
    --relation-type=hasMany
    \`\`\`

3. To remove an existing relationship:
    \`\`\`shell
    php artisan apitoolz:relation Customer --title=orders --remove
    \`\`\`


### What additional options are available for relationships?

Below are the available options for configuring relationships:

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| \`--title=\`              | The name of the relationship.                                              |
| \`--relation-model=\`     | The related model for the relationship.                                    |
| \`--relation-type=\`      | The type of relationship (\`belongsTo\`, \`hasOne\`, \`hasMany\`, etc.).   |
| \`--foreign-key=\`        | The foreign key for the relationship.                                      |
| \`--display-field=\`      | The field to display for the related model.                                |
| \`--sub-relation-model=\` | Define sub-relations for nested relationships.                             |
| \`--remove\`              | Remove the specified relationship.                                         |
| \`--force\`               | Force the operation without confirmation.                                  |

`
    },
    {
      title: 'How can I define filters for a model?',
      text: `

You can define filters for a model using the \`apitoolz:filter\` Artisan command. Filters allow you to apply specific criteria to model queries, enabling more dynamic and customizable data retrieval.

Below are some examples:

1. To define a filter with a specific type:
    \`\`\`shell
    php artisan apitoolz:filter Product \\
    --title=category \\
    --filter-type=select \\
    --filter-model=Category \\
    --filter-key=category_id \\
    --display-field=name
    \`\`\`

2. To define a filter with a custom query:
    \`\`\`shell
    php artisan apitoolz:filter Order \\
    --title=status \\
    --filter-type=select \\
    --filter-query='pending:Pending|completed:Completed|canceled:Canceled' \\
    --filter-key=status
    \`\`\`

3. To define a filter with a radio type:
    \`\`\`shell
    php artisan apitoolz:filter Product \\
    --title=availability \\
    --filter-type=radio \\
    --filter-query='in_stock:In Stock|out_of_stock:Out of Stock' \\
    --filter-key=availability
    \`\`\`

4. To define a filter with a checkbox type:
    \`\`\`shell
    php artisan apitoolz:filter Product \\
    --title=published \\
    --filter-type=checkbox \\
    --filter-query='Is Active' \\
    --filter-key=published
    \`\`\`

5. To remove an existing filter:
    \`\`\`shell
    php artisan apitoolz:filter Product --title=category --remove
    \`\`\`

6. To force remove a filter without confirmation:
    \`\`\`shell
    php artisan apitoolz:filter Order --title=status --remove --force
    \`\`\`

### Available Options for Filters

| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| \`--title=\`              | The name of the filter.                                                    |
| \`--filter-type=\`        | The type of filter (\`select\`, \`checkbox\`, radio).                         |
| \`--filter-model=\`       | The model to use for external filter values.                               |
| \`--filter-query=\`       | Query for predefined filter options (e.g., \`key:value|key2:value2\`).       |
| \`--filter-key=\`         | The key field for the filter (e.g., \`id\`).                                 |
| \`--display-field=\`      | The field to display for the filter options.                               |
| \`--remove\`              | Remove the specified filter.                                               |
| \`--force\`               | Force the removal operation without requiring confirmation.                |

`
    },
    {
      title: 'How can I rebuild or remove a Restful API model?',
      text: `
To rebuild your Restful API model:

\`\`\`shell
php artisan apitoolz:model Customer --rebuild
\`\`\`

To remove your model along with its database table:

\`\`\`shell
php artisan apitoolz:model Product --remove --remove-table
\`\`\`
`
    },
    {
      title: 'How can I export models?',
      text: `
APIToolz allows you to export models using the \`apitoolz:export\` Artisan command. Below are some examples:

1. To export all models along with their data:
    \`\`\`shell
    php artisan apitoolz:export --include-data
    \`\`\`

2. To export a specific model by name:
    \`\`\`shell
    php artisan apitoolz:export --model=Customer --include-data
    \`\`\`
`
    },
    {
      title: 'How can I import models?',
      text: `
You can import models using the \`apitoolz:import\` Artisan command. Below are some examples:

1. To import a model from a file:
    \`\`\`shell
    php artisan apitoolz:import --file=your_file.zip
    \`\`\`

2. To import a specific model by name without including its data:
    \`\`\`shell
    php artisan apitoolz:import --file=your_file.zip --model=Customer --exclude-data
    \`\`\`
`
    }
  ];

  const generateItems = () => {
    return (
      <Accordion allowMultiple={false}>
        {items.map((item, index) => (
          <AccordionItem key={index} title={item.title}>
            <MarkdownViewer content={item.text} />
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">FAQ</h3>
      </div>
      <div className="card-body py-3">{generateItems()}</div>
    </div>
  );
};

export { MiscFaq, type IFaqItem, type IFaqItems };
