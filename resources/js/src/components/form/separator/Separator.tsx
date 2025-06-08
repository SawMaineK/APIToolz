import { FormSeparator } from '../base/form-separator';

export const Separator = (formField: FormSeparator) => {
  return (
    formField.defaultLength == 1 && (
      <div
        className={`border-t border-dashed mt-4 mb-4 ${formField.altClass}`}
        style={formField.style}
      ></div>
    )
  );
};
