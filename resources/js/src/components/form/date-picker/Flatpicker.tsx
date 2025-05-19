import Flatpickr from 'react-flatpickr';
import { FormGroup } from 'react-reactive-form';
import moment from 'moment';
import { useRef } from 'react';
import 'flatpickr/dist/flatpickr.min.css';

interface IFlatpickerProps {
  handler: any;
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
  maxDate
}: IFlatpickerProps) => {
  const flatpickrRef = useRef<any>(null);

  const getValue = () => {
    if (formGroup?.controls) {
      return moment(formGroup?.controls[formField.name].value || formField?.value).toDate();
    }
    return moment(formField?.value).toDate();
  };

  const handleChange = (selectedDates: Date[]) => {
    const date = selectedDates[0];
    try {
      if (formGroup) {
        const formatted = moment(date).format(
          dateFormat || (enableTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
        );
        formGroup.controls[formField?.name].setValue(formatted);
        formGroup.controls[formField?.name].markAsTouched();
      }
      flatpickrRef.current?.flatpickr?.close();
    } catch (err) {
      console.error(err);
    }
  };

  const getDateLimit = (value: string) => {
    try {
      return value == 'today'
        ? new Date().toISOString().split('T')[0]
        : value
          ? new Date(value).toISOString().split('T')[0]
          : undefined;
    } catch (error) {
      return undefined;
    }
  };

  const handleClose = () => {
    try {
      if (formGroup?.controls) {
        formGroup.controls[formField?.name].markAsTouched();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Flatpickr
      ref={flatpickrRef}
      data-enable-time={enableTime}
      placeholder={placeholder}
      readOnly={false}
      value={getValue()}
      options={{
        altInput: true,
        altInputClass: `${inputClass}`,
        enableTime,
        minDate: getDateLimit(minDate || ''),
        maxDate: getDateLimit(maxDate || ''),
        altFormat: enableTime ? 'F j, Y H:i' : 'F j, Y',
        dateFormat: enableTime ? 'Y-m-d H:i:S' : 'Y-m-d',
        appendTo: document.body,
        onChange: handleChange,
        onClose: handleClose
      }}
    />
  );
};
