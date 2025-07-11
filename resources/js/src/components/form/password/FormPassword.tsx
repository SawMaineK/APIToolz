import { useState } from 'react';
import { FormInput } from '../base/form-input';

export const FormPassword = ({ handler, formGroup, ...props }: FormInput) => {
  const [type, setType] = useState('password');
  const unqKey = (Math.random() + 1).toString(36).substring(7);
  return (
    <div className="w-full">
      <div
        className={`${props.display == 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display} ${props.altClass}`}
        style={props.style}
      >
        {props.label && (
          <label className="form-label max-w-64">
            {props.label}
            {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="flex flex-col w-full gap-1">
          {props.component ? (
            <>{props.component(handler, formGroup, props)}</>
          ) : (
            <div className={`input`}>
              {props.prefix || props.prefixHtml ? (
                <span dangerouslySetInnerHTML={{ __html: props.prefixHtml || props.prefix }}></span>
              ) : null}
              <input
                {...handler()}
                autoComplete={props.autoComplete || 'off'}
                type={type}
                name={props.name || props.unqKey}
                placeholder={props.placeholder}
                readOnly={props.readonly}
                className={props.inputClass}
              />
              {props.tooltip ? (
                <span className="leading-none" data-tooltip={`#${props.name}-${unqKey}-tooltip`}>
                  <i className="ki-outline ki-information-4"></i>
                </span>
              ) : null}
              {props.endfix || props.endfixHtml ? (
                <span dangerouslySetInnerHTML={{ __html: props.endfixHtml || props.endfix }}></span>
              ) : null}
              {props.passwordHash && (
                <button
                  type="button"
                  onClick={() => {
                    if (props.passwordHash) {
                      const chars =
                        typeof props.passwordHash === 'string'
                          ? props.passwordHash
                          : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
                      let result = '';
                      for (let i = 0; i < props.hashLength; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      const input = document.querySelector<HTMLInputElement>(
                        `input[name="${props.name}"]`
                      );
                      if (input) {
                        props.value = result;
                        if (handler && typeof handler === 'function') {
                          handler().onChange(result);
                        }
                      }
                    }
                  }}
                >
                  <i className={`ki-outline ki-lock`}></i>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>(
                    `input[name="${props.name}"]`
                  );
                  if (input) {
                    setType(type === 'password' ? 'text' : 'password');
                  }
                }}
              >
                <i className={`ki-outline ${type === 'password' ? 'ki-eye' : 'ki-eye-slash'}`}></i>
              </button>
            </div>
          )}
          {props.hint && (
            <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
          )}
          {props.tooltip ? (
            <div className="tooltip" id={`${props.name}-${unqKey}-tooltip`}>
              {props.tooltip}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
