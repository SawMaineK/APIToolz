import { RadioBox } from './RadioBox';
import { BaseForm } from '../base/base-form';
import { FormRadioGroup } from '../base/form-radio-group';

export const RadioBoxGroup = ({ handler, formGroup, ...props }: FormRadioGroup) => {
  return (
    <>
      {props.label && (
        <label className="form-label mb-2">
          {props.label}
          {props.tooltip && (
            <span className="ml-2 text-gray-500">
              <i className="las la-question-circle text-lg"></i>
            </span>
          )}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="">
        {props.childs.map((field: BaseForm<string>, index: number) => {
          return <RadioBox {...field} handler={handler} formGroup={formGroup} key={index} />;
        })}
      </div>
      {props.hint && (
        <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
      )}
    </>
  );
};
