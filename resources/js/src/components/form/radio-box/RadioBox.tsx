import { FormRadio } from '../base/form-radio';

export const RadioBox = ({ handler, formGroup, ...props }: FormRadio) => {
  return (
    <div className={props.columns}>
      <div className={`mb-4 ${props.altClass}`} style={props.style}>
        {props.component ? (
          <>{props.component(handler, formGroup, props)}</>
        ) : (
          <div>
            <label
              className="form-label flex items-center gap-2.5"
              htmlFor={`${props.name}-${props.value}-${props.unqKey || 0}`}
            >
              <input
                {...handler('radio', props.value)}
                className={`radio ${props.inputClass}`}
                id={`${props.name}-${props.value}-${props.unqKey || 0}`}
                type="radio"
              />
              {props.label}
            </label>
            {/* hint Text */}
            {props.hint && (
              <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
