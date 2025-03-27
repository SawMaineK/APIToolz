import { FormHidden } from '../base/form-hidden';
import { Hidden } from './Hidden';

interface IFormInput extends FormHidden {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormHidden;
}
export const HiddenControl = ({ handler, meta }: IFormInput | any) => {
  return <Hidden {...meta} handler={handler} />;
};
