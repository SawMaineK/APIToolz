import { FormSwitch } from '../base/form-switch';

export const Switch = ({ handler, ...props }: FormSwitch) => {
  return (
    <div>
      <div className={`form-group ${props.altClass}`} style={props.style}>
        <div className={`${props.inputClass}`}>
          <label className="switch form-label" htmlFor={props.name}>
            <input {...handler('checkbox')} type="checkbox" id={props.name} />
            {props.label}
            {/* Required */}
            {props.required && <b className="text-red-500">*</b>}
            {/* Tooltip */}
            {props.tooltip && (
              <span className="form-tooltip">
                <i className="las la-question-circle fs-3 ms-2"></i>
              </span>
            )}
          </label>
        </div>
        {/* hint Text */}
        {props.hint && (
          <div className="form-text" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
        )}
      </div>
    </div>
  );
};
