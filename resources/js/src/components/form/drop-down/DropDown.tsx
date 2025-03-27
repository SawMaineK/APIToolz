import { useEffect, useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { FormSelect } from '../base/form-select';

interface Option {
  label: string;
  value: string;
}

export const DropDown = ({ handler, formGroup, formLayout, ...props }: FormSelect | any) => {
  const values = formGroup.controls || {};
  const filterKey = props.filter?.key || null;
  const filterValue = useMemo(
    () => (props.filter ? values[props.filter.parent]?.value || props.value : null),
    [props.filter, values, props.value]
  );

  const getDataList = useCallback(() => {
    return props.options
      .filter((option: any) => !props.filter || option[filterKey] === filterValue)
      .map((option: any) => ({ value: option.id, label: option.name }));
  }, [props.options, props.filter, filterKey, filterValue]);

  const [dataList, setDataList] = useState(getDataList);
  const [value, setValue] = useState<Option | Option[] | null>(null);

  const onChange = useCallback(
    (selectedOption: any) => {
      const newValue = props.multiple
        ? (selectedOption as Option[]).map((item) => item?.value)
        : selectedOption?.value;

      props.valueChanges$?.next(newValue);
      props.valueChangeEvent?.(newValue, formGroup);

      setValue(selectedOption);
      if (formGroup.controls) {
        formGroup.controls[props.name].setValue(newValue);
        formGroup.markAsSubmitted();
        formGroup.markAsUnsubmitted();
      }
    },
    [props, formGroup]
  );

  const getValue = useMemo(() => {
    const selectedValues = props.multiple
      ? dataList.filter((opt: any) => values[props.name]?.value?.includes(opt.value))
      : dataList.find((opt: any) => opt.value === values[props.name]?.value);

    formGroup.controls?.[props.name].setValue(
      props.multiple ? selectedValues.map((item: any) => item.value) : selectedValues?.value || '',
      { onlySelf: false, emitEvent: !!props.options$ }
    );

    return selectedValues ?? (props.multiple ? null : '');
  }, [dataList, props.multiple, props.name, values, props.options$, formGroup]);

  useEffect(() => {
    if (props.submitted$) {
      props.submitted$.subscribe((submitted: boolean) => {
        if (submitted) {
          setValue(dataList);
          formGroup.markAsSubmitted();
          formGroup.markAsUnsubmitted();
        }
      });
    }
  }, [props.submitted$, dataList, formGroup]);

  const loadOptions = useCallback(
    debounce((inputValue: string, callback: any) => {
      props
        .options$(
          inputValue,
          props.filter ? { key: filterKey, value: filterValue } : null,
          formGroup
        )
        .then((results: any[]) => {
          setDataList(results || []);
          callback(results || []);
          setValue(getValue);
          formGroup.markAsSubmitted();
          formGroup.markAsUnsubmitted();
        });
    }, 1000),
    [props.options$, props.filter, filterKey, filterValue, formGroup, getValue]
  );

  useEffect(() => {
    if (props.options$) {
      loadOptions('', () => {});
    } else {
      setDataList(getDataList());
      formGroup.markAsSubmitted();
      formGroup.markAsUnsubmitted();
    }
  }, [filterValue]);

  const styles = {
    control: (base: any, state: any) => ({
      ...base,
      color: 'var(--tw-gray-700)',
      backgroundColor: 'var(--tw-light-active)',
      fontSize: '0.8125rem',
      fontWeight: '500',
      minHeight: '2.5rem',
      padding: '0 0.1rem',
      borderWidth: '1px',
      borderRadius: '0.375rem',
      borderColor: state.isFocused
        ? props.focusBorderColor || 'var(--tw-primary)'
        : props.borderColor || 'var(--tw-gray-300)',
      '&:hover': {
        borderColor: props.focusBorderColor || 'var(--tw-primary)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      fontSize: '0.9rem',
      zIndex: 9999
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: '0.85rem',
      backgroundColor: state.isFocused ? 'var(--tw-light-active)' : base.backgroundColor,
      color: state.isFocused ? 'var(--tw-gray-700)' : base.color
    })
  };

  const SelectComponent = props.options$ ? (
    <AsyncSelect
      {...handler()}
      styles={styles}
      className={props.inputClass}
      classNamePrefix="form-select"
      name={props.name}
      value={value}
      onChange={onChange}
      defaultOptions={dataList}
      loadOptions={loadOptions}
      placeholder={props.placeholder || 'Select...'}
      isDisabled={props.readonly}
      isMulti={props.multiple}
      isClearable
      cacheOptions
    />
  ) : (
    <Select
      {...handler()}
      styles={styles}
      className={props.inputClass}
      classNamePrefix="form-select"
      name={props.name}
      value={getValue}
      onChange={onChange}
      options={dataList}
      placeholder={props.placeholder || 'Select...'}
      isDisabled={props.readonly}
      isMulti={props.multiple}
      isClearable
    />
  );

  return (
    <div className="w-full">
      <div
        className={`${props.display === 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display} ${props.altClass}`}
        style={props.style}
      >
        {props.label && (
          <label className="form-label max-w-32">
            {props.label}
            {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="flex flex-col w-full gap-1">
          {props.component ? (
            props.component(handler, formGroup, props)
          ) : (
            <div>
              {props.prefixHtml && (
                <span dangerouslySetInnerHTML={{ __html: props.prefixHtml }}></span>
              )}
              {SelectComponent}
              {props.tooltip && (
                <span className="leading-none" data-tooltip={`#${props.name}-tooltip`}>
                  <i className="ki-outline ki-information-4"></i>
                </span>
              )}
              {props.endfixHtml && (
                <span dangerouslySetInnerHTML={{ __html: props.endfixHtml }}></span>
              )}
            </div>
          )}
          {props.hint && (
            <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
          )}
          {props.tooltip && (
            <div className="tooltip" id={`${props.name}-tooltip`}>
              {props.tooltip}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
