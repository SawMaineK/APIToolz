import { FormInput as Base } from '../base/form-input';

export const FormInputGroup = ({ handler, formGroup, ...props }: Base) => {
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
          {props.component ? (
            <>{props.component(handler, formGroup, props)}</>
          ) : (
            <div className="input-group">
              {props.prefix || props.prefixHtml ? (
                <span
                  className="btn btn-input"
                  dangerouslySetInnerHTML={{ __html: props.prefixHtml || props.prefix }}
                ></span>
              ) : null}
              <input
                name={props.name}
                placeholder={props.placeholder}
                type={props.type || 'text'}
                value={props.value}
                className={`input ${props.inputClass}`}
              />
              {props.endfix || props.endfixHtml ? (
                <span
                  className="btn btn-input"
                  dangerouslySetInnerHTML={{ __html: props.endfixHtml || props.endfix }}
                ></span>
              ) : null}
            </div>
          )}
          {props.hint && (
            <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
          )}
        </div>
      </div>
    </div>
  );
};
