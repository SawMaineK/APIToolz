import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { FormSelect } from '../base/form-select';

interface Option {
  label: string;
  value: string;
}

export const DropDown = ({ handler, formGroup, formLayout, ...props }: FormSelect | any) => {
  const values: any = formGroup.controls;
  const filterKey = () => {
    return props.filter ? props.filter.key : null;
  };
  const filterValue = () => {
    return props.filter ? values[props.filter.parent]?.value || props.value : null;
  };

  const getDataList = () => {
    let list: any[] = [];
    props.options.forEach((option: any) => {
      if (props.filter && values && values[props.filter.parent]) {
        if (option[filterKey()] === filterValue()) {
          list.push({ value: option.value, label: option.label });
        }
      } else {
        list.push({ value: option.value, label: option.label });
      }
    });

    return list;
  };

  const onChange = (option: any) => {
    const value = props.multiple
      ? (option as Option[]).map((item: Option) => item && item.value)
      : option && (option as Option).value;
    props.valueChanges$?.next(value);
    if (props.valueChangeEvent) {
      props.valueChangeEvent(value, formGroup);
    }
    setValue(option);
    if (formGroup.controls) {
      formGroup.controls[props.name].setValue(value);
      // Refresh Form Data
      formGroup.markAsSubmitted();
      formGroup.markAsUnsubmitted();
    }
  };

  const [dataList, setDataList] = useState(getDataList() as any[]);

  const getValue = (dataList: any[] = []) => {
    if (dataList && dataList.length > 0) {
      const value: any[] | any = props.multiple
        ? dataList.filter(
            (option: any) =>
              values &&
              values[props.name].value &&
              values[props.name].value.indexOf(option.value) >= 0
          )
        : dataList.find((x: any) => x.value == formGroup.value[props.name]);
      if (formGroup.controls) {
        formGroup.controls[props.name].setValue(
          props.multiple
            ? value.length > 0
              ? (value as Option[]).map((item: Option) => item && item.value)
              : ''
            : value !== undefined
              ? value && (value as Option).value
              : '',
          { onlySelf: false, emitEvent: props.options$ || false }
        );
      }
      return value === undefined ? (props.multiple ? null : ('' as any)) : value;
    } else {
      if (formGroup.controls) {
        formGroup.controls[props.name].setValue(props.multiple ? null : ('' as any), {
          onlySelf: false,
          emitEvent: props.options$ || false
        });
      }
      return props.multiple ? null : ('' as any);
    }
  };

  useEffect(() => {
    if (formGroup && typeof formGroup.reset === 'function') {
      const originalReset = formGroup.reset;
      formGroup.reset = (...args: any[]) => {
        originalReset.apply(formGroup, args);
        setValue(getValue(dataList));
        formGroup.markAsSubmitted();
        formGroup.markAsUnsubmitted();
      };
      return () => {
        formGroup.reset = originalReset;
      };
    }
  }, [formGroup, dataList]);

  const wait = 1000;
  const loadOptions: any = (inputValue: string = '', callback: any = () => {}) => {
    props
      .options$(
        inputValue,
        props.filter
          ? {
              key: filterKey(),
              value: formGroup.value[props.filter?.parent] || null
            }
          : null,
        formGroup
      )
      .then((results: any[]) => {
        setDataList(results || []);
        callback(results || []);
        setValue(getValue(results || []));
        // Refresh Form Data
        formGroup.markAsSubmitted();
        formGroup.markAsUnsubmitted();
      });
    return;
  };

  const [value, setValue] = useState(null as any);
  const debouncedLoadOptions = debounce(loadOptions, wait);

  useEffect(() => {
    if (props.options$) {
      props.options$ && loadOptions();
    } else {
      setDataList(getDataList());
      // Refresh Form Data
      formGroup.markAsSubmitted();
      formGroup.markAsUnsubmitted();
    }
  }, [filterValue()]);

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
      },
      ...(props.darkMode && {
        color: 'var(--tw-gray-300)',
        backgroundColor: 'var(--tw-dark-active)',
        borderColor: state.isFocused
          ? props.focusBorderColor || 'var(--tw-primary-dark)'
          : props.borderColor || 'var(--tw-gray-600)'
      })
    }),
    menu: (base: any) => ({
      ...base,
      fontSize: '0.9rem',
      zIndex: 9999,
      backgroundColor: 'var(--tw-light)',
      ...(props.darkMode && {
        backgroundColor: 'var(--tw-dark)'
      })
    }),
    option: (base: any, state: any) => ({
      ...base,
      fontSize: '0.85rem',
      backgroundColor: state.isFocused
        ? props.darkMode
          ? 'var(--tw-dark-active)'
          : 'var(--tw-light-active)'
        : base.backgroundColor,
      color: state.isFocused
        ? props.darkMode
          ? 'var(--tw-gray-300)'
          : 'var(--tw-gray-700)'
        : base.color
    }),
    placeholder: (base: any) => ({
      ...base,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    })
  };

  const SelectComponent = props.options$ ? (
    <AsyncSelect
      {...handler()}
      styles={styles}
      className={`min-w-[200px] ${props.inputClass}`}
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
      className={`min-w-[200px] ${props.inputClass}`}
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
          <label className="form-label max-w-64">
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
