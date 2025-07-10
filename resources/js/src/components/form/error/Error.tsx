export const Error = ({ touched, hasError, getError, submitted, dirty, ...props }: any) => {
  return (
    <div className="w-full">
      <div
        className={`${props.display == 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display} ${props.altClass}`}
      >
        <label className="form-label max-w-32"></label>
        <div className="flex flex-col w-full gap-1">
          <div className="text-sm text-red-600">
            {(submitted || dirty || touched) && hasError('required') && (
              <div>This field is required.</div>
            )}
            {(submitted || dirty || touched) && hasError('email') && (
              <div>This field must be a valid email address.</div>
            )}
            {(submitted || dirty || touched) && hasError('minLength') && (
              <div>
                This field must be at least {getError('minLength').requiredLength} characters.
              </div>
            )}
            {(submitted || dirty || touched) && hasError('maxLength') && (
              <div>
                This field must not be more than {getError('maxLength').requiredLength} characters.
              </div>
            )}
            {(submitted || dirty || touched) && hasError('min') && (
              <div>
                This field's value must be greater than or equal to {getError('min').requiredLength}
                .
              </div>
            )}
            {(submitted || dirty || touched) && hasError('max') && (
              <div>
                This field's value must be less than or equal to {getError('max').requiredLength}.
              </div>
            )}
            {(submitted || dirty || touched) && hasError('pattern') && (
              <div>This field must match the required pattern.</div>
            )}
            {(submitted || dirty || touched) && hasError('password_confirmation') && (
              <div>The password does not match.</div>
            )}
            {hasError && hasError('serverError') && <div>{getError('serverError')}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
