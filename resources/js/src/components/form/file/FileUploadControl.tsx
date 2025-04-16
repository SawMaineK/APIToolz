import { FormFile } from '../base/form-file';
import { Error } from '../error/Error';
import { FileUpload } from './FileUpload';
interface IFormFile extends FormFile {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormFile;
}
export const FileUploadControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormFile | any) => {
  return (
    <div className="mb-4">
      <FileUpload {...meta} formGroup={meta.formGroup} handler={handler} />
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
