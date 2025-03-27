import { FormRadio } from '../base/form-radio';

export const RadioCustom2 = ({ handler, formGroup, ...props }: FormRadio) => {
  return (
    <>
      <input
        {...handler('radio', props.value)}
        className="hidden"
        id={`radio_custom_2-${props.value}`}
      />
      <label
        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer flex items-center"
        htmlFor={`radio_custom_2-${props.value}`}
      >
        <span className="font-semibold text-xl text-gray-800">{props.label}</span>
      </label>
    </>
  );
};
