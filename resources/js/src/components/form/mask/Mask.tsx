import InputMask from 'react-input-mask';
import { FormInputMask } from '../base/form-input-mask';

// Reference for more detail in below link
// https://github.com/sanniassin/react-input-mask
export const Mask = ({ handler, formGroup, ...props }: FormInputMask) => {
  const unqKey = (Math.random() + 1).toString(36).substring(7);
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
            <div className="input">
              {props.prefix || props.prefixHtml ? (
                <span dangerouslySetInnerHTML={{ __html: props.prefixHtml || props.prefix }}></span>
              ) : null}
              <InputMask
                {...handler()}
                {...props.config}
                mask={props.mask}
                alwaysShowMask={true}
                maskPlaceholder={props.maskPlaceholder}
                placeholder={props.placeholder}
                name={props.unqKey || props.name}
                readOnly={props.readonly}
                className={`${props.inputClass}`}
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
