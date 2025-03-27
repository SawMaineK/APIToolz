import { FormNote } from '../base/form-note';

export const Note = (formField: FormNote) => {
  return (
    <div
      className={`notice flex rounded border border-dashed p-6 ${formField.altClass}`}
      style={formField.style}
    >
      {(formField.prefix || formField.prefixHtml) && (
        <span
          className={`input-group-text ${formField.inputClass}`}
          dangerouslySetInnerHTML={{ __html: formField.prefixHtml || formField.prefix }}
        ></span>
      )}

      <div className="flex flex-grow items-center">
        <div className="font-bold">
          <h4 className="text-gray-800 font-semibold">{formField.label}</h4>
          <div
            className="text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: formField.hint }}
          ></div>
        </div>
      </div>

      {(formField.endfix || formField.endfixHtml) && (
        <span
          className={`input-group-text ${formField.inputClass}`}
          dangerouslySetInnerHTML={{ __html: formField.endfixHtml || formField.endfix }}
        ></span>
      )}
    </div>
  );
};
