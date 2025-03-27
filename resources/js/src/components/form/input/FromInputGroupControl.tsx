import { FormInput as Base } from '../base/form-input';
import { Error } from '../error/Error';
import { FormInputGroup } from './FormInputGroup';
interface IFormInput extends Base {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: Base;
}
export const FormInputGroupControl = ({
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
      <FormInputGroup {...meta} handler={handler} />
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
