import { FormInput } from '../base/form-input';
import { CheckBox } from './CheckBox';
import { Error } from '../error/Error';

interface IFormInput extends FormInput {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormInput;
}
export const CheckBoxControl = ({
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
      <CheckBox {...meta} handler={handler} />
      <Error
        touched={touched}
        submitted={submitted}
        dirty={dirty}
        hasError={hasError}
        getError={getError}
      />
    </div>
  );
};
