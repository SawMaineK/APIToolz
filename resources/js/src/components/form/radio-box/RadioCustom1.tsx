import { FormRadio } from '../base/form-radio';

export const RadioCustom1 = ({ handler, formGroup, ...props }: FormRadio) => {
  return (
    <>
      <input
        {...handler('radio', props.value)}
        className="hidden"
        id={`radio_custom_1-${props.value}`}
      />
      <label
        className="flex items-center mb-4 p-4 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 cursor-pointer"
        htmlFor={`radio_custom_1-${props.value}`}
      >
        <span
          className="svg-icon w-12 h-12 mr-4"
          dangerouslySetInnerHTML={{ __html: props.prefixHtml }}
        ></span>
        <span className="flex flex-col text-left">
          <span className="text-lg font-semibold text-gray-800 mb-1">{props.label}</span>
          <span className="text-sm text-gray-500">{props.hint}</span>
        </span>
      </label>
    </>
  );
};
