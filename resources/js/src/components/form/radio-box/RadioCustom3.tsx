import { FormRadio } from '../base/form-radio';

export const RadioCustom3 = ({ handler, formGroup, ...props }: FormRadio) => {
  return (
    <>
      <label className="flex items-center mb-5 cursor-pointer">
        <span className="flex items-center mr-2">
          <span className="w-12 h-12 mr-3 rounded-full border border-gray-300 flex items-center justify-center">
            <span
              className="svg-icon svg-icon-1 text-gray-600"
              dangerouslySetInnerHTML={{ __html: props.prefixHtml }}
            ></span>
          </span>
          <span className="flex flex-col">
            <span className="font-semibold text-gray-800 hover:text-primary text-xl">
              {props.label}
            </span>
            <span className="text-sm font-bold text-gray-500">{props.hint}</span>
          </span>
        </span>
        <span className="relative inline-block">
          <input
            {...handler('radio', props.value)}
            className="form-radio h-5 w-5 text-primary border-gray-300 focus:ring-primary"
          />
        </span>
      </label>
    </>
  );
};
