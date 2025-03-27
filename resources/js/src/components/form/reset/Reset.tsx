import { FormReset } from '../base/form-reset';

export const Reset = (formField: FormReset) => {
  return (
    <div>
      <div className={`${formField.altClass}`} style={formField.style}>
        <button type="reset" className={`btn btn-light ${formField.inputClass} flex items-center`}>
          {/* Form Prefix */}
          {formField.prefix || formField.prefixHtml ? (
            <span
              dangerouslySetInnerHTML={{ __html: formField.prefixHtml || formField.prefix }}
              className="mr-2"
            ></span>
          ) : null}
          {/* Form Label */}
          <span className="text-sm font-medium">{formField.label}</span>
          {/* Form Endfix */}
          {formField.endfix || formField.endfixHtml ? (
            <span
              dangerouslySetInnerHTML={{ __html: formField.endfixHtml || formField.endfix }}
              className="ml-2"
            ></span>
          ) : null}
        </button>
      </div>
    </div>
  );
};
