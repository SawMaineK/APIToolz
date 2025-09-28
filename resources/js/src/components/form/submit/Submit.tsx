import { useEffect, useState } from 'react';
import { FormSubmit } from '../base/form-submit';

export const Submit = ({ formGroup, ...props }: FormSubmit) => {
  const [submitted, setSubmitted] = useState(true);

  // This effect runs once when the component is mounted.
  useEffect(() => {
    if (formGroup && props.submitted$) {
      const subscription = props.submitted$.subscribe((submited: boolean) => {
        setSubmitted(submited);
      });

      // Cleanup subscription on component unmount
      return () => subscription.unsubscribe();
    }
  }, [formGroup, props.submitted$]); // Dependency array ensures effect runs only when formGroup or submitted$ changes

  const handler = () => {
    // Define your handler logic here
  };

  return (
    <div className="w-full">
      <div
        className={`${props.display == 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display}`}
        style={props.style}
      >
        {props.display == 'x' && <label className="form-label max-w-32"></label>}

        <div className={props.altClass}>
          {props.component ? (
            <>{props.component(handler, formGroup, props)}</>
          ) : (
            <button
              type="submit"
              className={`btn btn-primary ${props.inputClass}`}
              disabled={!submitted || props.disabled}
            >
              {/* Form Prefix */}
              {(props.prefix || props.prefixHtml) && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: props.prefixHtml || props.prefix
                  }}
                ></span>
              )}
              {/* Form Label */}
              {submitted ? props.label : <span>Please wait...</span>}
              {/* Form Endfix */}
              {(props.endfix || props.endfixHtml) && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: props.endfixHtml || props.endfix
                  }}
                ></span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
