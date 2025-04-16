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
  min?: any;
  max?: any;
}

export const Flatpicker = ({
  formField,
  formGroup,
  dateFormat,
  enableTime = false,
  placeholder,
  inputClass,
  min,
  max
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
        minDate: min,
        maxDate: max,
        altFormat: enableTime ? 'F j, Y H:i' : 'F j, Y',
        dateFormat: enableTime ? 'Y-m-d H:i:S' : 'Y-m-d',
        onChange: handleChange,
        onClose: handleClose
      }}
    />
  );
};
