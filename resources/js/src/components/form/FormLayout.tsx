import { Subject } from 'rxjs';
import {
  FormGroup,
  FieldArray,
  FormArray,
  FormControl,
  AbstractControl,
  FieldGroup,
  Validators,
  ValidatorFn,
  ValidationErrors
} from 'react-reactive-form';
import { Alert } from '@/components';
import { BaseForm } from './base/base-form';
import { BaseFormArray } from './base/form-array';
import { FormCheckBox } from './base/form-checkbox';
import { BaseFormGroup } from './base/form-group';
import { FormRadio } from './base/form-radio';
import { FormField } from './FormField';

// import { requestFileUpload } from '../../services/AuthService';
import { useEffect, useState } from 'react';
import { FormPassword } from './base/form-password';

export const toFormGroup = (
  form: BaseForm<string | boolean>[],
  data: any = {},
  clone: any = {}
) => {
  const group: any = {};
  form.forEach((x: BaseForm<string>) => {
    switch (x.controlType) {
      case 'form_group':
        if (x.name) {
          let formGroup: FormGroup | any = {};
          x.formGroup.forEach((y: BaseForm<string>) => {
            if (y.name) {
              switch (y.controlType) {
                case 'form_group':
                  formGroup[y.name] = toFormGroup(
                    y.formGroup,
                    (data[x.name] && data[x.name][y.name]) ||
                      (clone[x.name] && clone[x.name][y.name]) ||
                      {}
                  );
                  break;
                case 'form_array': {
                  y.defaultLength =
                    (data[x.name] && data[x.name][y.name] && data[x.name][y.name].length) ||
                    (clone[x.name] && clone[x.name][y.name] && clone[x.name][y.name].length) ||
                    y.defaultLength ||
                    1;
                  let formArray: FormArray = new FormArray([]);
                  for (let i = 0; i < y.defaultLength; i++) {
                    formArray.push(
                      toFormGroup(
                        y.formArray,
                        (data[x.name] && data[x.name][y.name] && data[x.name][y.name][i]) ||
                          (clone[x.name] && clone[x.name][y.name] && clone[x.name][y.name][i]) ||
                          {}
                      )
                    );
                  }
                  formGroup[y.name] = formArray;
                  break;
                }
                default: {
                  let validators: any[] = y.required ? [Validators.required] : [];
                  let value =
                    (data[x.name] && data[x.name][y.name]) ||
                    (clone[x.name] && clone[x.name][y.name]) ||
                    null;
                  if (y instanceof FormCheckBox) {
                    value = value || '';
                  } else if (y instanceof FormRadio) {
                    value = y.required ? value || y.value : value || '';
                  } else {
                    value = value || y.value || '';
                  }
                  formGroup[y.name] = new FormControl(value, [...validators, ...y.validators]);
                  break;
                }
              }
            }
          });
          group[x.name] = new FormGroup(formGroup);
        }
        break;
      case 'form_array':
        if (x.name) {
          x.defaultLength =
            (data[x.name] && data[x.name].length) ||
            (clone[x.name] && clone[x.name].length) ||
            x.defaultLength ||
            1;
          let formArray: FormArray = new FormArray([]);
          for (let i = 0; i < x.defaultLength; i++) {
            formArray.push(
              toFormGroup(
                x.formArray,
                (data[x.name] && data[x.name][i]) || (clone[x.name] && clone[x.name][i]) || {}
              )
            );
          }
          group[x.name] = formArray;
        }
        break;
      default:
        if (x.name) {
          let validators: any[] = x.required ? [Validators.required] : [];
          let value = data[x.name] || clone[x.name] || null;
          if (x instanceof FormCheckBox) {
            value = value || '';
          } else if (x instanceof FormRadio) {
            value = x.required ? value || x.value : value || '';
          } else if (x instanceof FormPassword) {
            value = '';
          } else {
            value = value || x.value || '';
          }
          group[x.name] = new FormControl(value, [...validators, ...x.validators]);
        }
        break;
    }
  });
  return new FormGroup(group);
};

const getFormType = (
  form: BaseForm<string | boolean>[],
  key: string,
  callbackType: (type: any) => void
) => {
  form.forEach((x: BaseForm<string>) => {
    switch (x.controlType) {
      case 'form_group':
        getFormType(x.formGroup, key, callbackType);
        break;
      case 'form_array':
        x.formArray.forEach((y) => {
          switch (y.controlType) {
            case 'form_group':
              getFormType(y.formGroup, key, callbackType);
              break;
            case 'form_array':
              y.formArray.forEach((z: BaseForm<string>) => {
                switch (z.controlType) {
                  case 'form_group':
                    getFormType(z.formGroup, key, callbackType);
                    break;
                  default:
                    if (z.name == key) {
                      callbackType(z);
                    }
                    break;
                }
              });
              break;
            default:
              if (y.name == key) {
                callbackType(y);
              }
              break;
          }
        });
        break;
      default:
        if (x.name == key) {
          callbackType(x);
        }
        break;
    }
  });
};

export const passwordConfirmation = (
  passwordKey: string = 'password',
  passwordConfirmationKey: string = 'password_confirmation'
): ValidatorFn => {
  return (group: FormGroup | any): ValidationErrors | null => {
    let passwordInput = group.controls[passwordKey],
      passwordConfirmationInput = group.controls[passwordConfirmationKey];
    if (passwordInput.value !== passwordConfirmationInput.value) {
      passwordConfirmationInput.setErrors({ notEquivalent: true });
    } else {
      passwordConfirmationInput.setErrors(null);
    }
    return null;
  };
};

export type IFormLayout = {
  formLayout: BaseForm<string>[];
  initValues?: any;
  valiations?: Function | Function[] | any;
  onSubmitForm: (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => void;
  onResetForm?: (formGroup: FormGroup) => void;
};

export const FormLayout = (props: IFormLayout) => {
  const [formGroup, setFormGroup] = useState(null as any);
  const [submitted$, setSubmitted$] = useState(null as any);

  useEffect(() => {
    const submitted$: Subject<boolean> = new Subject<boolean>();
    const formGroup: FormGroup = toFormGroup(props.formLayout, props.initValues || {});
    formGroup.setValidators(props.valiations);
    setFormGroup(formGroup);
    setSubmitted$(submitted$);
  }, []);

  return (
    formGroup && (
      <FieldGroup
        control={formGroup}
        render={(form: any) => {
          return (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
                form.markAsSubmitted();
                if (form.valid) {
                  submitted$.next(false);
                  props.onSubmitForm && props.onSubmitForm(form.value, form, submitted$);
                }
              }}
              onReset={(e) => {
                e.preventDefault();
                form.reset(props.initValues, {});
                props.onResetForm && props.onResetForm(form);
              }}
              noValidate
              className="space-y-6" // Tailwind class for spacing between form elements
            >
              {form.hasError('submit') && <Alert variant="danger">{form.getError('submit')}</Alert>}
              <div className="flex flex-wrap -mx-4">
                <FormLayoutControl
                  formLayout={props.formLayout}
                  formGroup={formGroup}
                  initValues={props.initValues}
                  submitted$={submitted$}
                />
              </div>
            </form>
          );
        }}
      />
    )
  );
};

interface IFormLayoutControl {
  formLayout: BaseForm<string>[];
  formGroup: FormGroup | any;
  initValues?: any;
  submitted$?: any;
}
export const FormLayoutControl = (props: IFormLayoutControl) => {
  return (
    <FieldGroup
      control={props.formGroup}
      render={() => (
        <>
          {props.formLayout.map((formField: BaseForm<string>, index: number) => {
            const matchValue = (values: any[] | boolean | string, criteriaValue: string | any) => {
              if (Array.isArray(values)) {
                return values.includes(criteriaValue);
              }
              return values === criteriaValue || false;
            };

            const addValidators = (form: BaseFormGroup, formGroup: FormGroup) => {
              if (form.name && form instanceof BaseFormGroup) {
                let group = formGroup.get(form.name);
                form.formGroup.forEach((x: BaseForm<string>) => {
                  if (x.name && x instanceof BaseFormGroup) {
                    addValidators(x, group as FormGroup);
                  } else if (x.name && x instanceof BaseFormArray) {
                    addValidators(x, group as FormGroup);
                  } else if (x.name) {
                    let validators: any[] = x.required ? [Validators.required] : [];
                    (group as FormGroup).controls[x.name].setValidators([
                      ...validators,
                      ...x.validators
                    ]);
                    (group as FormGroup).controls[x.name].updateValueAndValidity({
                      onlySelf: false,
                      emitEvent: false
                    });
                  }
                });
              }
              if (form.name && form instanceof BaseFormArray) {
                let group = (formGroup.get(form.name) as FormArray).controls;
                group.forEach((y) => {
                  form.formArray.forEach((x: BaseForm<string>) => {
                    if (x.name && x instanceof BaseFormGroup) {
                      addValidators(x, y as FormGroup);
                    } else if (x.name && x instanceof BaseFormArray) {
                      addValidators(x, y as FormGroup);
                    } else if (x.name) {
                      let validators: any[] = x.required ? [Validators.required] : [];
                      (y as FormGroup).controls[x.name].setValidators([
                        ...validators,
                        ...x.validators
                      ]);
                      (y as FormGroup).controls[x.name].updateValueAndValidity({
                        onlySelf: false,
                        emitEvent: false
                      });
                    }
                  });
                });
              }
            };

            const removeValidators = (form: BaseFormGroup, formGroup: FormGroup) => {
              if (form.name && form instanceof BaseFormGroup) {
                let group = formGroup.get(form.name) as FormGroup;
                form.formGroup.forEach((x: BaseForm<string>) => {
                  if (x.name && x instanceof BaseFormGroup) {
                    removeValidators(x, group as FormGroup);
                  } else if (x.name && x instanceof BaseFormArray) {
                    removeValidators(x, group as FormGroup);
                  } else if (x.name) {
                    (group as FormGroup).controls[x.name].setValue('', {
                      onlySelf: false,
                      emitEvent: false
                    });
                    (group as FormGroup).controls[x.name].clearValidators();
                    (group as FormGroup).controls[x.name].updateValueAndValidity({
                      onlySelf: false,
                      emitEvent: false
                    });
                  }
                });
              }
              if (form.name && form instanceof BaseFormArray) {
                let group = (formGroup.get(form.name) as FormArray).controls;
                group.forEach((y) => {
                  form.formArray.forEach((x: BaseForm<string>) => {
                    if (x.name && x instanceof BaseFormGroup) {
                      removeValidators(x, y as FormGroup);
                    } else if (x.name && x instanceof BaseFormArray) {
                      removeValidators(x, y as FormGroup);
                    } else if (x.name) {
                      (y as FormGroup).controls[x.name].setValue('', {
                        onlySelf: false,
                        emitEvent: false
                      });
                      (y as FormGroup).controls[x.name].clearValidators();
                      (y as FormGroup).controls[x.name].updateValueAndValidity({
                        onlySelf: false,
                        emitEvent: false
                      });
                    }
                  });
                });
              }
            };

            const hasCriteria = (form: BaseFormGroup | any, group: any) => {
              if (form.name && form.criteriaValue) {
                if (
                  form.criteriaValue &&
                  matchValue(form.criteriaValue.value, group.value[form.criteriaValue.key])
                ) {
                  addValidators(form, group);
                  return true;
                } else {
                  removeValidators(form, group);
                  return false;
                }
              }
              return true;
            };

            switch (formField.controlType) {
              case 'form_group':
                return (
                  <div
                    key={index}
                    className={`flex flex-wrap ${formField.columns} ${formField.altClass}`}
                  >
                    {hasCriteria(formField, props.formGroup) && (
                      <FormLayoutControl
                        formLayout={formField.formGroup}
                        formGroup={props.formGroup.get(formField.name)}
                        initValues={props.initValues && props.initValues[formField.name]}
                      />
                    )}
                  </div>
                );
              case 'form_array':
                return (
                  <div key={index} className={`w-full ${formField.columns} ${formField.altClass}`}>
                    {hasCriteria(formField, props.formGroup) && (
                      <div className="form-array">
                        <div className="px-4 mb-4">
                          <label className="text-md font-semibold">{formField.label}</label>
                        </div>
                        <FormTableControl
                          formField={formField}
                          formLayout={formField.formArray}
                          formArray={props.formGroup.get(formField.name) as FormArray}
                          initValues={(props.initValues && props.initValues[formField.name]) || []}
                        />
                      </div>
                    )}
                  </div>
                );
              default:
                formField.submitted$ = props.submitted$;
                return (
                  <div key={index} className={`${formField.columns} px-4`}>
                    <FormField
                      formLayout={props.formLayout}
                      formField={formField}
                      formGroup={props.formGroup}
                    />
                  </div>
                );
            }
          })}
        </>
      )}
    />
  );
};

type IFormTableControl = {
  formField: BaseForm<string>;
  formLayout: BaseForm<string>[];
  formArray: FormArray;
  initValues?: any;
};
export const FormTableControl = (props: IFormTableControl) => {
  return (
    <FieldArray
      name={props.formField.name}
      render={({ controls, length }: FormArray | any) => {
        const addMore = () => {
          const formControl = toFormGroup(props.formLayout, {});
          formControl.meta = {
            key: length++
          };
          props.formArray.push(formControl);
        };

        const removeAt = (trIdx: any) => {
          //props.formArray.removeAt(index);
          console.log(props.formArray, trIdx);
          if (trIdx > -1) {
            props.formArray.removeAt(trIdx);
          }
        };

        return (
          <div className={`grid px-4 mb-4 ${props.formField.altClass}`}>
            {!props.formField.useTable &&
              controls.map((formGroup: AbstractControl, index: number) => {
                return (
                  <div className="flex items-center" key={`${formGroup.meta.key}-${String(index)}`}>
                    <div className="w-full -mx-4">
                      <FormLayoutControl
                        formLayout={props.formLayout}
                        formGroup={formGroup}
                        initValues={props.initValues[index] || {}}
                      />
                    </div>
                    {!props.formField.readonly && (
                      <button
                        onClick={() => removeAt(index)}
                        className="text-red-600 hover:text-red-800 focus:outline-none ms-4"
                        type="button"
                      >
                        <i className="ki-filled ki-trash"></i>
                      </button>
                    )}
                  </div>
                );
              })}

            {props.formField.useTable && (
              <div className="card min-w-full">
                <div className="card-table overflow-x-auto">
                  <table className="table align-middle text-gray-700 font-medium text-sm">
                    <thead>
                      {props.formField.tableHeader &&
                        props.formField.tableHeader.map((header: any, index: number) => {
                          return (
                            <tr
                              className="text-gray-500 font-semibold uppercase text-sm border-b"
                              key={index}
                            >
                              {header.map((th: any, thIdx: number) => {
                                return (
                                  <th
                                    className="text-gray-700 px-3 py-2"
                                    colSpan={th.colSpan}
                                    rowSpan={th.rowSpan}
                                    style={th.style}
                                    key={thIdx}
                                  >
                                    {th.label}
                                  </th>
                                );
                              })}
                              {/* ADD BUTTON */}
                              {!props.formField.readonly && (
                                <th className="pl-2 w-[20px]">
                                  <button
                                    onClick={addMore}
                                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                    type="button"
                                    title={props.formField.addMoreText || 'Add Row'}
                                  >
                                    <i className="ki-filled ki-plus-squared text-2xl" />
                                  </button>
                                </th>
                              )}
                            </tr>
                          );
                        })}
                      {!props.formField.tableHeader && (
                        <tr className="text-gray-500 font-semibold uppercase text-sm border-b">
                          {props.formLayout.map((field: BaseForm<string>, index: number) => {
                            return (
                              <th
                                className={`px-3 py-2 ${field.columns}`}
                                style={field.controlType == 'hidden' ? { display: 'none' } : {}}
                                key={index}
                              >
                                {field.label}
                              </th>
                            );
                          })}
                          {/* ADD BUTTON */}
                          {!props.formField.readonly && (
                            <th className="pl-2 w-[20px]">
                              <button
                                onClick={addMore}
                                className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                type="button"
                                title={props.formField.addMoreText || 'Add Row'}
                              >
                                <i className="ki-filled ki-plus-squared text-2xl" />
                              </button>
                            </th>
                          )}
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {controls.map((formGroup: AbstractControl | any, trIdx: number) => {
                        return (
                          <tr key={trIdx} className="border-b">
                            <FieldGroup
                              control={props.formArray.at(trIdx)}
                              render={() => (
                                <>
                                  {props.formLayout.map(
                                    (field: BaseForm<string>, tdIdx: number) => {
                                      return (
                                        <td
                                          className={`${field.columns} px-3 py-2`}
                                          style={
                                            field.controlType == 'hidden' ? { display: 'none' } : {}
                                          }
                                          key={tdIdx}
                                        >
                                          {field.controlType !== 'form_group' &&
                                            field.controlType !== 'form_array' && (
                                              <div className="mb-2">
                                                <FormField
                                                  formLayout={props.formLayout}
                                                  formField={field}
                                                  formGroup={formGroup}
                                                />
                                              </div>
                                            )}
                                        </td>
                                      );
                                    }
                                  )}
                                </>
                              )}
                            />
                            {!props.formField.readonly && (
                              <td className="pl-1 w-[20px]">
                                <button
                                  onClick={() => removeAt(trIdx)}
                                  className="text-red-600 hover:text-red-800 focus:outline-none"
                                  type="button"
                                >
                                  <i className="ki-filled ki-trash text-xl"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!props.formField.useTable && !props.formField.readonly && (
              <div className="text-right">
                <button
                  onClick={addMore}
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-4 py-2"
                  type="button"
                >
                  <i className="las la-plus-circle text-xl mr-2"></i>
                  <span>{props.formField.addMoreText}</span>
                </button>
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
