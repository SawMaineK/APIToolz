import { useState, useEffect } from 'react';
import { FormCheckBox } from '../base/form-checkbox';

export const CheckBox = ({ handler, formGroup, ...props }: FormCheckBox) => {
  const unqKey = (Math.random() + 1).toString(36).substring(7);
  const [checked, setChecked] = useState(formGroup.controls[props.name]?.value || false);

  useEffect(() => {
    // Sync with formGroup when value changes or form resets
    setChecked(formGroup.controls[props.name]?.value || false);
  }, [formGroup.controls[props.name]?.value]); // Listen for value changes

  const handleChange = (event: any) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);

    // Update formGroup state
    formGroup.controls[props.name]?.setValue(isChecked, { onlySelf: false, emitEvent: true });
  };

  return (
    <div className="w-full">
      <div
        className={`${props.display === 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display} ${props.altClass}`}
        style={props.style}
      >
        {props.display === 'x' && <label className="form-label max-w-32"></label>}
        <div className="flex flex-col w-full gap-1">
          {props.component ? (
            <>{props.component(handler, formGroup, props)}</>
          ) : (
            <div className="flex items-start space-x-3">
              <label className="checkbox flex items-center gap-2.5">
                <input
                  {...handler('checkbox')}
                  className={`checkbox ${props.inputClass}`}
                  id={`${props.name}-${unqKey}`}
                  type="checkbox"
                  checked={checked}
                  onChange={handleChange}
                />
                <span>{props.label}</span>
              </label>
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
