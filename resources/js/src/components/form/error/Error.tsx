export const Error = ({ touched, hasError, getError, submitted, dirty, ...props }: any) => {
  const shouldShow = submitted || dirty || touched;

  // fallback defaults
  const defaultMessages: Record<string, string> = {
    required: 'This field is required.',
    email: 'This field must be a valid email address.',
    minLength: 'This field is too short.',
    maxLength: 'This field is too long.',
    min: 'This field value is too small.',
    max: 'This field value is too large.',
    pattern: 'This field must match the required pattern.',
    password_confirmation: 'The password does not match.'
  };

  const getMessage = (rule: string) => getError(rule)?.message || defaultMessages[rule];

  return (
    <div className="w-full">
      <div
        className={`${
          props.display == 'x'
            ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5'
            : props.display
        } ${props.altClass}`}
      >
        <label className="form-label max-w-32"></label>
        <div className="flex flex-col w-full gap-1">
          <div className="text-sm text-red-600">
            {shouldShow && hasError('required') && <div>{getMessage('required')}</div>}
            {shouldShow && hasError('email') && <div>{getMessage('email')}</div>}
            {shouldShow && hasError('minLength') && <div>{getMessage('minLength')}</div>}
            {shouldShow && hasError('maxLength') && <div>{getMessage('maxLength')}</div>}
            {shouldShow && hasError('min') && <div>{getMessage('min')}</div>}
            {shouldShow && hasError('max') && <div>{getMessage('max')}</div>}
            {shouldShow && hasError('pattern') && <div>{getMessage('pattern')}</div>}
            {shouldShow && hasError('password_confirmation') && (
              <div>{getMessage('password_confirmation')}</div>
            )}
            {hasError && hasError('serverError') && <div>{getError('serverError')}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
