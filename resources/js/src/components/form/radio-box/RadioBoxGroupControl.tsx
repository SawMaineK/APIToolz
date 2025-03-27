import { FormInput } from '../base/form-input';
import { Error } from '../error/Error';
import { RadioBoxGroup } from './RadioBoxGroup';

interface IFormInput extends FormInput {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormInput;
}
export const RadioBoxGroupControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormInput | any) => {
  return (
    <div className="mb-4">
      <RadioBoxGroup {...meta} formGroup={meta.formGroup} handler={handler} />
      {(meta.required || meta.validators) && (
        <div className="mt-n4">
          <Error
            touched={touched}
            submitted={submitted}
            dirty={dirty}
            hasError={hasError}
            getError={getError}
          />
        </div>
      )}
    </div>
  );
};
