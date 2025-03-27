import { FormComponent } from '../base/form-component';

interface ComponentProps extends FormComponent {
  handler: any;
  formGroup: any;
}

export const Component = ({ handler, formGroup, ...props }: ComponentProps) => {
  return (
    <div className="w-full">
      <div
        className={`${props.display == 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display} ${props.altClass}`}
        style={props.style}
      >
        {props.label && (
          <label className="form-label max-w-32">
            {props.label}
            {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="flex flex-col w-full gap-1">
          {props.component ? <>{props.component(handler, formGroup, props)}</> : <></>}
          {props.hint && (
            <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
          )}
        </div>
      </div>
    </div>
  );
};
