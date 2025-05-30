import { KeenIcon } from '@/components/keenicons';
import { FormDate } from '../base/form-date';
import { Flatpicker } from './Flatpicker';

interface DatePickerProps extends FormDate {
  handler: any;
  formGroup: any;
}

export const DatePicker = ({ handler, formGroup, ...props }: DatePickerProps) => {
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
            <div className="input">
              {props.prefix || props.prefixHtml ? (
                <span dangerouslySetInnerHTML={{ __html: props.prefixHtml || props.prefix }}></span>
              ) : null}
              <Flatpicker
                handler={handler}
                formField={props}
                formGroup={formGroup}
                enableTime={false}
                placeholder={props.placeholder}
                readonly={props.readonly}
                minDate={props.minDate}
                maxDate={props.maxDate}
                dateFormat={props.dateFormat}
                inputClass={props.inputClass}
              />
              {props.tooltip ? (
                <span className="leading-none" data-tooltip={`#${props.name}-${unqKey}-tooltip`}>
                  <i className="ki-outline ki-information-4"></i>
                </span>
              ) : null}
              {props.endfix || props.endfixHtml ? (
                <span dangerouslySetInnerHTML={{ __html: props.endfixHtml || props.endfix }}></span>
              ) : (
                <span>
                  <KeenIcon icon="calendar-2" />
                </span>
              )}
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
