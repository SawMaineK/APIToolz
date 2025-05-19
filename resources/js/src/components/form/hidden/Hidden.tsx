import { FormHidden } from '../base/form-hidden';

export const Hidden = ({ handler, ...props }: FormHidden) => {
  return (
    <div className={`mb-4 ${props.altClass || ''}`} style={{ display: 'none', ...props.style }}>
      {props.label && (
        <label className="block text-sm font-medium text-gray-700">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
          {props.tooltip && (
            <span
              className="ml-2 text-gray-400 cursor-pointer"
              data-tooltip={props.tooltip}
              title={props.tooltip}
            >
              <i className="las la-question-circle"></i>
            </span>
          )}
        </label>
      )}

      <input
        {...handler()}
        type={props.type}
        autoComplete="off"
        name={props.unqKey || props.name}
        readOnly={props.readonly}
        className="hidden"
      />
    </div>
  );
};
