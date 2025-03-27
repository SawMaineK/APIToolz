import Flatpickr from 'react-flatpickr';
import { FormGroup } from 'react-reactive-form';
import 'flatpickr/dist/flatpickr.min.css';
import moment from 'moment';

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
  handler,
  formField,
  formGroup,
  dateFormat,
  enableTime = false,
  placeholder,
  inputClass,
  readonly,
  min,
  max
}: IFlatpickerProps) => {
  const getValue = () => {
    if (formGroup?.controls) {
      return moment(formGroup?.controls[formField.name].value || formField?.value).format(
        'YYYY-MM-DD HH:MM'
      );
    }
    return moment(formField?.value).format('YYYY-MM-DD HH:MM');
  };
  return enableTime ? (
    <Flatpickr
      data-enable-time
      placeholder={placeholder}
      readOnly={readonly}
      value={getValue()}
      options={{
        altInput: true,
        altInputClass: `${inputClass}`,
        enableTime: true,
        minDate: min,
        maxDate: max,
        altFormat: 'F j, Y H:m',
        dateFormat: 'Y-m-d h:m:s',
        onChange([date]) {
          try {
            if (formGroup) {
              formGroup.controls[formField?.name].setValue(
                moment(date).format(dateFormat || 'Y-MM-DD h:m:s')
              );
              formGroup.controls[formField?.name].markAsTouched();
            }
          } catch (err) {
            console.error(err);
          }
        },
        onClose([date]) {
          try {
            if (formGroup) {
              formGroup.controls[formField?.name].setValue(
                moment(date).format(dateFormat || 'Y-MM-DD h:m:s')
              );
              formGroup.controls[formField?.name].markAsTouched();
            }
          } catch (err) {
            console.error(err);
          }
        }
      }}
    />
  ) : (
    <Flatpickr
      placeholder={placeholder}
      readOnly={readonly}
      value={getValue()}
      options={{
        altInput: true,
        altInputClass: `${inputClass}`,
        minDate: min,
        maxDate: max,
        altFormat: 'F j, Y',
        dateFormat: 'Y-m-d',
        onChange([date]) {
          try {
            if (formGroup?.controls) {
              formGroup.controls[formField?.name].setValue(
                moment(date).format(dateFormat || 'Y-MM-DD')
              );
            }
          } catch (err) {
            console.error(err);
          }
        },
        onClose() {
          try {
            if (formGroup?.controls) {
              formGroup.controls[formField?.name].markAsTouched();
            }
          } catch (err) {
            console.error(err);
          }
        }
      }}
    />
  );
};
