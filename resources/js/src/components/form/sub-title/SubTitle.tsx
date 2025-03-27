import { FormSubTitle } from '../base/form-sub-title';

export const SubTitle = (formField: FormSubTitle) => {
  return (
    <div className={`${formField.altClass}`}>
      <h4 className="text-sm text-gray-600 font-medium" style={formField.style}>
        <span dangerouslySetInnerHTML={{ __html: formField.label }}></span>
        {formField.tooltip && (
          <span className="form-tooltip">
            <i className="las la-question-circle text-xl"></i>
          </span>
        )}
        {formField.required && <b className="required"></b>}
      </h4>
      {formField.hint && (
        <div
          className="text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: formField.hint }}
        ></div>
      )}
    </div>
  );
};
