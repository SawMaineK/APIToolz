import { FormGroup, Validators, FieldControl } from 'react-reactive-form';
import { BaseForm } from './base/base-form';
import { Reset } from './reset/Reset';
import { Submit } from './submit/Submit';
import { CheckBoxControl } from './check-box/CheckBoxControl';
import { DatePickerControl } from './date-picker/DatePickerControl';
import { DateTimePickerControl } from './date-picker/DateTimePickerControl';
import { DropDownControl } from './drop-down/DropDownControl';
import { TextBoxControl } from './text-box/TextBoxControl';
import { RadioBoxGroupControl } from './radio-box/RadioBoxGroupControl';
import { TextAreaControl } from './text-area/TextAreaControl';
import { Label } from './label/Label';
import { Note } from './note/Note';
import { Title } from './title/Title';
import { SubTitle } from './sub-title/SubTitle';
import { Separator } from './separator/Separator';
import { SwitchControl } from './switch/SwitchControl';
import { FileUploadControl } from './file/FileUploadControl';
import { MaskControl } from './mask/MaskControl';
import { EditorControl } from './editor/EditorControl';
import { Text } from './text/Text';
import { HiddenControl } from './hidden/HiddenControl';
import { CoderControl } from './coder/CoderControl';
import { ComponentControl } from './component/ComponentControl';
import { FormPasswordControl } from './password/FromPasswordControl';

type IFormField = {
  formLayout: BaseForm<string>[];
  formField: BaseForm<string>;
  formGroup: FormGroup;
};

export const FormField = (props: IFormField) => {
  const values = props.formGroup.controls;

  const matchValue = (values: any[] | boolean | string, criteriaValue: string | any) => {
    if (Array.isArray(values)) {
      return values.includes(criteriaValue);
    }
    return values === criteriaValue || values === `${criteriaValue}` || false;
  };

  const hasCriteria = () => {
    if (props.formField.criteriaValue) {
      if (
        props.formField.criteriaValue &&
        matchValue(
          props.formField.criteriaValue.value,
          values[props.formField.criteriaValue.key]?.value
        )
      ) {
        if (props.formField.name) {
          let validators: any[] = props.formField.required ? [Validators.required] : [];
          validators = [...validators, ...props.formField.validators];
          props.formGroup.controls[props.formField.name].setValidators(validators);
          props.formGroup.controls[props.formField.name].updateValueAndValidity({
            onlySelf: false,
            emitEvent: false
          });
        }
        return true;
      } else {
        if (props.formField.name) {
          props.formGroup.controls[props.formField.name].setValue('', {
            onlySelf: true,
            emitEvent: false
          });
          props.formGroup.controls[props.formField.name].clearValidators();
          props.formGroup.controls[props.formField.name].updateValueAndValidity({
            onlySelf: false,
            emitEvent: false
          });
        }
        return false;
      }
    }
    return true;
  };

  return (
    <div>
      {props.formField.controlType === 'title' && hasCriteria() && <Title {...props.formField} />}
      {props.formField.controlType === 'sub_title' && hasCriteria() && (
        <SubTitle {...props.formField} />
      )}
      {props.formField.controlType === 'label' && hasCriteria() && <Label {...props.formField} />}
      {props.formField.controlType === 'text' && hasCriteria() && <Text {...props.formField} />}
      {props.formField.controlType === 'note' && hasCriteria() && <Note {...props.formField} />}
      {props.formField.controlType === 'separator' && hasCriteria() && (
        <Separator {...props.formField} />
      )}
      {props.formField.controlType === 'textbox' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <TextBoxControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'password' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <FormPasswordControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'component' && hasCriteria() && (
        <ComponentControl meta={{ ...props.formField, formGroup: props.formGroup }} />
      )}
      {props.formField.controlType === 'hidden' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <HiddenControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'mask' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <MaskControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'textarea' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <TextAreaControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'editor' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <EditorControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'coder' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <CoderControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'checkbox' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={CheckBoxControl}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'switch' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <SwitchControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'file' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <FileUploadControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'radio_group' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <RadioBoxGroupControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'dropdown' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <DropDownControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'date' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <DatePickerControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'datetime' && hasCriteria() && (
        <FieldControl
          name={props.formField.name}
          render={(fieldControlProps) => <DateTimePickerControl {...fieldControlProps} />}
          meta={{ ...props.formField, formGroup: props.formGroup }}
        />
      )}
      {props.formField.controlType === 'submit' && hasCriteria() && (
        <Submit {...props.formField} formGroup={props.formGroup} />
      )}
      {props.formField.controlType === 'reset' && hasCriteria() && <Reset {...props.formField} />}
    </div>
  );
};
