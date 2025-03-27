import { FormInputMask } from '../base/form-input-mask';
import { Error } from '../error/Error';
import { Mask } from './Mask';
interface IFormInputMask extends FormInputMask {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormInputMask;
}
export const MaskControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormInputMask | any) => {
  return (
    <div className="mb-4">
      <Mask {...meta} handler={handler} />
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
