import { FormTextArea } from '../base/form-textarea';

export const TextArea = ({ handler, formGroup, ...props }: FormTextArea) => {
  const unqKey = (Math.random() + 1).toString(36).substring(7);
  return (
    <div className="w-full">
      <div
        className={`${props.display == 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display} ${props.altClass}`}
        style={props.style}
      >
        {props.label && (
          <label className="form-label max-w-64">
            {props.label}
            {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="flex flex-col w-full gap-1">
          {props.component ? (
            <>{props.component(handler, formGroup, props)}</>
          ) : (
            <div>
              {props.prefix || props.prefixHtml ? (
                <span dangerouslySetInnerHTML={{ __html: props.prefixHtml || props.prefix }}></span>
              ) : null}
              <textarea
                {...handler()}
                rows={props.defaultLength || 3}
                autoComplete="off"
                name={props.name}
                placeholder={props.placeholder}
                readOnly={props.readonly}
                disabled={props.disabled}
                className={`textarea ${props.inputClass}`}
              />
              {props.tooltip ? (
                <span className="leading-none" data-tooltip={`#${props.name}-${unqKey}-tooltip`}>
                  <i className="ki-outline ki-information-4"></i>
                </span>
              ) : null}
              {props.endfix || props.endfixHtml ? (
                <span dangerouslySetInnerHTML={{ __html: props.endfixHtml || props.endfix }}></span>
              ) : null}
            </div>
          )}
          {props.hint && (
            <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
          )}
          {props.tooltip ? (
            <div className="tooltip" id={`${props.name}-${unqKey}-tooltip`}>
              {props.tooltip}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
