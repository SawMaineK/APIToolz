import { FormInput as Base } from '../base/form-input';
import { Error } from '../error/Error';
import { FormInput } from './FormInput';
interface IFormInput extends Base {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: Base;
}
export const FormInputControl = ({
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
      <FormInput {...meta} handler={handler} />
      <Error
        display={meta.display}
        touched={touched}
        submitted={submitted}
        dirty={dirty}
        hasError={hasError}
        getError={getError}
      />
    </div>
  );
};
