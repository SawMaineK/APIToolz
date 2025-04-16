import { FormComponent } from '../base/form-component';
import { Error } from '../error/Error';
import { Component } from './Component';
interface IFormComponent extends FormComponent {
  handler: any;
  touched: any;
  submitted: boolean;
  dirty: boolean;
  hasError: any;
  getError: any;
  meta: FormComponent;
}
export const ComponentControl = ({
  handler,
  touched,
  submitted,
  dirty,
  hasError,
  getError,
  meta
}: IFormComponent | any) => {
  return (
    <div className="mb-4">
      <Component {...meta} handler={handler} />
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
