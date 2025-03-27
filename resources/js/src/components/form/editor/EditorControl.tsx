import { FormInputEditor } from '../base/form-editor';
import { Error } from '../error/Error';
import { Editor } from './Editor';
interface IFormInputEditor extends FormInputEditor {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormInputEditor;
}
export const EditorControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormInputEditor | any) => {
  return (
    <div className="mb-4">
      <Editor {...meta} handler={handler} formGroup={meta.formGroup} />
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
