import { FormCoder } from '../base/form-coder';
import { Error } from '../error/Error';
import { Coder } from './Coder';
interface IFormCoder extends FormCoder {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: IFormCoder;
}
export const CoderControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormCoder | any) => {
  return (
    <div className="mb-4">
      <Coder {...meta} handler={handler} formGroup={meta.formGroup} />
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
