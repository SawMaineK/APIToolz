import { FormInput } from '../base/form-input';
import { Error } from '../error/Error';
import { TextBox } from './TextBox';
interface IFormInput extends FormInput {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormInput;
}
export const TextBoxControl = ({
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
      <TextBox {...meta} handler={handler} />
      {(meta.required || meta.validator) && (
        <Error
          {...meta}
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
