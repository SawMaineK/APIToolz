import { FormDateTime } from '../base/form-datetime';
import { DateTimePicker } from './DateTimePicker';
import { Error } from '../error/Error';

interface IFormDateTime extends FormDateTime {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormDateTime;
}

export const DateTimePickerControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormDateTime | any) => {
  return (
    <div className="mb-4">
      <DateTimePicker {...meta} formGroup={meta.formGroup} handler={handler} />
      {(meta.required || meta.validator) && (
        <Error
          touched={touched}
          submitted={submitted}
          dirty={dirty}
          hasError={hasError}
          getError={getError}
        />
      )}
    </div>
  );
};
