import { FormLabel } from '../base/form-label';

interface LabelProps extends FormLabel {}

export const Label = ({ altClass = '', style, label, required, tooltip, hint }: LabelProps) => {
  return (
    <div>
      <div className={`form-group ${altClass}`} style={style}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {/* Required Indicator */}
            {required && <span className="text-red-500 ml-1">*</span>}
            {/* Tooltip */}
            {tooltip && (
              <span className="ml-2 text-gray-400">
                <i className="las la-question-circle text-lg"></i>
              </span>
            )}
          </label>
        )}
        {hint && (
          <div
            className="text-xs text-gray-500 mt-1"
            dangerouslySetInnerHTML={{ __html: hint }}
          ></div>
        )}
      </div>
    </div>
  );
};
