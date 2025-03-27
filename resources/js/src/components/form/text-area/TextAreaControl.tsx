import { FormTextArea } from '../base/form-textarea';
import { Error } from '../error/Error';
import { TextArea } from './TextArea';
interface IFormInput extends FormTextArea {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormTextArea;
}
export const TextAreaControl = ({
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
      <TextArea {...meta} handler={handler} />
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
