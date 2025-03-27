import { FormSeparator } from '../base/form-separator';

export const Separator = (formField: FormSeparator) => {
  return (
    <div
      className={`border-t border-dashed mb-4 ${formField.altClass}`}
      style={formField.style}
    ></div>
  );
};
