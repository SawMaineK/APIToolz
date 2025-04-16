import { DropDown } from './DropDown';
import { FormSelect } from '../base/form-select';
import { Error } from '../error/Error';

interface IFormSelect extends FormSelect {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormSelect;
}
export const DropDownControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormSelect | any) => {
  return (
    <div className="mb-4">
      <DropDown
        {...meta}
        formGroup={meta.formGroup}
        formLayout={meta.formLayout}
        handler={handler}
      />
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
