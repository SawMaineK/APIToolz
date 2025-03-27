import { FormTitle } from '../base/form-title';

export const Title = (formField: FormTitle) => {
  return (
    <div className={`${formField.altClass}`}>
      <h1 className={`text-lg leading-5 font-semibold text-gray-900`} style={formField.style}>
        <span dangerouslySetInnerHTML={{ __html: formField.label }}></span>
        {formField.tooltip && (
          <span className="form-tooltip">
            <i className="las la-question-circle text-2xl"></i>
          </span>
        )}
        {formField.required && <b className="text-red-500">*</b>}
      </h1>
      {formField.hint && (
        <div
          className="text-sm text-gray-500"
          dangerouslySetInnerHTML={{ __html: formField.hint }}
        ></div>
      )}
    </div>
  );
};
