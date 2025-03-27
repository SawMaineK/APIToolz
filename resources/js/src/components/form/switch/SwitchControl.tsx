import { Switch } from './Switch';
import { Error } from '../error/Error';
import { FormSwitch } from '../base/form-switch';

interface IFormSwitch extends FormSwitch {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormSwitch;
}
export const SwitchControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormSwitch | any) => {
  return (
    <div className="mb-4">
      <Switch {...meta} handler={handler} />
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
