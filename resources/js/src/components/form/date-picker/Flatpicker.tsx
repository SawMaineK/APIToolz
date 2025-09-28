import Flatpickr from 'react-flatpickr';
import { FormGroup } from 'react-reactive-form';
import moment from 'moment';
import { useRef, useEffect, useState } from 'react';
import 'flatpickr/dist/flatpickr.min.css';

interface IFlatpickerProps {
  handler?: any;
  formField?: any;
  formGroup?: FormGroup;
  dateFormat?: string;
  enableTime?: boolean;
  placeholder?: string;
  inputClass?: string;
  filter?: { parent: string; key: string };
  readonly?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const Flatpicker = ({
  formField,
  formGroup,
  dateFormat,
  enableTime = false,
  placeholder,
  inputClass,
  minDate,
  maxDate,
  readonly
}: IFlatpickerProps) => {
  const flatpickrRef = useRef<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const format = dateFormat || (enableTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');

  const getValue = () => {
    const rawValue =
      formGroup?.get(formField?.name)?.value ?? formField?.value ?? null;

    if (!rawValue || rawValue === '') return undefined;

    const m = moment(rawValue);
    return m.isValid() ? m.toDate() : undefined;
  };

  useEffect(() => {
    const value = getValue();
    if (value) {
      setSelectedDate(value);
    }

    // Ensure form control is updated with formatted value
    if (formGroup && formField?.name) {
      const control = formGroup.get(formField.name);
      if (control && value) {
        control.setValue(moment(value).format(format));
        control.markAsTouched();
      }
    }
  }, [formField?.value]);

  const handleChange = (selectedDates: Date[]) => {
    const date = selectedDates?.[0];
    if (!date) return;

    try {
      const formatted = moment(date).format(format);
      setSelectedDate(date);
      if (formGroup && formField?.name) {
        formGroup.get(formField.name)?.setValue(formatted);
        formGroup.get(formField.name)?.markAsTouched();
      }
      flatpickrRef.current?.flatpickr?.close();
    } catch (err) {
      console.error(err);
    }
  };

  const getDateLimit = (value: string) => {
    try {
      return value === 'today'
        ? new Date().toISOString().split('T')[0]
        : value
        ? new Date(value).toISOString().split('T')[0]
        : undefined;
    } catch {
      return undefined;
    }
  };

  const handleClose = () => {
    if (formGroup?.controls && formField?.name) {
      formGroup.get(formField.name)?.markAsTouched();
    }
  };

  return (
    <Flatpickr
      ref={flatpickrRef}
      value={selectedDate}
      data-enable-time={enableTime}
      placeholder={placeholder}
      readOnly={readonly}
      options={{
        altInput: true,
        altInputClass: inputClass ?? '',
        enableTime,
        minDate: getDateLimit(minDate || ''),
        maxDate: getDateLimit(maxDate || ''),
        altFormat: enableTime ? 'F j, Y H:i' : 'F j, Y',
        dateFormat: enableTime ? 'Y-m-d H:i:S' : 'Y-m-d',
        appendTo: document.body,
        clickOpens: !readonly,
        onChange: handleChange,
        onClose: handleClose
      }}
    />
  );
};
