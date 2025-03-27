import { FormDate } from '../base/form-date';
import { Error } from '../error/Error';
import { DatePicker } from './DatePicker';

interface IFormDate extends FormDate {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormDate;
}

export const DatePickerControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormDate | any) => {
  return (
    <div className="mb-4">
      <DatePicker {...meta} formGroup={meta.formGroup} handler={handler} />
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
