import { Subject, Subscription } from 'rxjs';
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
            if (y.name && x.name) {
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
  flowLayout?: boolean;
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
                {props.flowLayout ? (
                  <FlowFormLayoutControl
                    formLayout={props.formLayout}
                    formGroup={formGroup}
                    initValues={props.initValues}
                    submitted$={submitted$}
                  />
                ) : (
                  <FormLayoutControl
                    formLayout={props.formLayout}
                    formGroup={formGroup}
                    initValues={props.initValues}
                    submitted$={submitted$}
                  />
                )}
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
                        initValues={
                          formField.name && props.initValues && props.initValues[formField.name]
                        }
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
                          initValues={
                            (formField.name &&
                              props.initValues &&
                              props.initValues[formField.name]) ||
                            []
                          }
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

const getResponsiveWidthClass = (cols?: number) => {
  let base = 'w-full sm:w-full md:w-1/2 lg:w-1/3';
  switch (cols) {
    case 1:
      return `${base} xl:w-full`; // 1 columns large
    case 2:
      return `${base} xl:w-1/2`; // 2 columns large
    case 3:
      return `${base} xl:w-1/3`; // 3 columns large
    case 4:
      return `${base} xl:w-1/4`; // 4 columns large
    default:
      return `${base} xl:w-2/3`; // fallback
  }
};

const groupNodesByRow = (nodes: BaseForm<string>[], tolerance = 50) => {
  const sorted = [...nodes].sort((a: any, b: any) => (a.position?.y || 0) - (b.position?.y || 0));
  const rows: BaseForm<string>[][] = [];
  let currentRow: BaseForm<string>[] = [];
  let lastY: number | null = null;

  sorted.forEach((node: any) => {
    if (lastY === null || Math.abs((node.position?.y || 0) - lastY) < tolerance) {
      currentRow.push(node);
      lastY = lastY === null ? node.position?.y || 0 : Math.min(lastY, node.position?.y || 0);
    } else {
      rows.push([...currentRow]);
      currentRow = [node];
      lastY = node.position?.y || 0;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  // sort horizontally
  rows.forEach((row) => row.sort((a: any, b: any) => (a.position?.x || 0) - (b.position?.x || 0)));
  return rows;
};

export const FlowFormLayoutControl = (props: IFormLayoutControl) => {
  useEffect(() => {
    const subscriptions: Subscription[] = [];

    const findFieldDefinition = (key: string): BaseForm<string> | undefined => {
      let def = props.formLayout?.find((f) => f.name === key);
      if (!def && props.formLayout) {
        getFormType(props.formLayout, key, (type) => {
          if (!def) def = type;
        });
      }
      return def;
    };

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Resolve a dotted path like "plan_id.unitprice"
    // Uses: nested control via group.get(path), object value, or formDef.findOption (async)
    // Optimized getValueForPath: resolves dotted paths, supports arrays, objects, and async findOption
    const getValueForPath = async (path: string, rootGroup?: FormGroup): Promise<any> => {
      const parts = path.split('.');
      const root = parts[0];
      const rest = parts.slice(1);
      const formDef = findFieldDefinition(root);
      const resolveOption = async (ctrl?: AbstractControl | null) => {
        if (!ctrl || !formDef?.findOption) return undefined;
        try {
          const option = await formDef.findOption(ctrl.value);
          if (!option) return 0;
          let v: any = option;
          for (const p of rest) {
            if (v == null) return 0;
            v = v[p];
          }
          return v ?? 0;
        } catch {
          return 0;
        }
      };
      const resolveFromControl = (ctrl?: AbstractControl | null) => {
        if (!ctrl) return undefined;
        let v = ctrl.value;
        for (const p of rest) {
          if (v == null) return 0;
          if (Array.isArray(v)) {
            v = v.reduce((sum, item) => Number(sum) + Number(item?.[p] ?? 0), 0);
          } else {
            v = v[p];
          }
        }
        return v ?? 0;
      };

      const nestedLocalCtrl = rootGroup?.get(path);
      if (nestedLocalCtrl) return nestedLocalCtrl.value ?? 0;

      const localRootCtrl = rootGroup?.get(root);
      const localOptionValue = await resolveOption(localRootCtrl);
      if (localOptionValue !== undefined) return localOptionValue;
      const localResolved = resolveFromControl(localRootCtrl);
      if (localResolved !== undefined) return localResolved;

      const nestedCtrl = props.formGroup?.get(path);
      if (nestedCtrl) return nestedCtrl.value ?? 0;

      const rootCtrl = props.formGroup?.get(root);
      const optionValue = await resolveOption(rootCtrl);
      if (optionValue !== undefined) return optionValue;
      const resolved = resolveFromControl(rootCtrl);
      if (resolved !== undefined) return resolved;

      return 0;
    };

    // Evaluate an expression asynchronously (resolves findOption as needed)
    const evaluateExpressionAsync = async (
      expr: string,
      contextGroup?: FormGroup
    ): Promise<number | null> => {
      // tokens like "plan_id.unitprice" or "amount"
      const tokens = Array.from(new Set(expr.match(/[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*/g) || []));

      // Resolve all values (may be async because of findOption)
      const values = await Promise.all(tokens.map((t) => getValueForPath(t, contextGroup)));

      // Replace tokens with numeric literals (escaped)
      let substituted = expr;
      tokens.forEach((t, i) => {
        const rawVal = values[i];
        const num = typeof rawVal === 'number' ? rawVal : Number(rawVal ?? 0);
        substituted = substituted.replace(
          new RegExp('\\b' + escapeRegExp(t) + '\\b', 'g'),
          // ensure JS-flavored numeric literal
          Number.isFinite(num) ? num.toString() : '0'
        );
      });

      // Very small sanitization: allow only digits, whitespace, dot, parentheses, + - * / % operators
      if (!/^[0-9+\-*/().%\s]+$/.test(substituted)) {
        // Contains unexpected characters — abort
        return null;
      }

      try {
        const result = Function('"use strict"; return (' + substituted + ')')();
        if (typeof result === 'number' && isFinite(result)) {
          return result;
        }
      } catch (e) {
        // evaluation failed
      }

      return null;
    };

    const processField = (formField: BaseForm<string>, parentGroup: FormGroup | FormArray) => {
      if (!formField?.name || typeof formField.valueFn !== 'string') return;
      const m = formField.valueFn.match(/^{(.+)}$/);
      if (!m) return;
      const expr = m[1].trim();

      // exact single simple "key.prop" (no operators) -> use findOption branch if available
      const simpleMatch = expr.match(/^([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)$/);

      // tokens to subscribe to (roots)
      const tokens = Array.from(new Set(expr.match(/[a-zA-Z_]\w*(?:\.[a-zA-Z_]\w*)*/g) || []));
      const roots = Array.from(new Set(tokens.map((t) => t.split('.')[0])));

      // recalc function (async because of findOption)
      const recalc = async () => {
        // helper to set value on a single abstract control
        const applyToControl = async (
          target: AbstractControl | null,
          contextGroup?: FormGroup
        ) => {
          if (!target) return;
          const setIfChanged = (next: any) => {
            const normalizedNext = next === undefined ? null : next;
            const current = (target as any).value;
            const same =
              current === normalizedNext ||
              (typeof current === 'number' &&
                typeof normalizedNext === 'number' &&
                Number.isNaN(current) &&
                Number.isNaN(normalizedNext));
            if (same) return;
            target.setValue(normalizedNext, { onlySelf: false, emitEvent: true });
          };

          if (simpleMatch) {
            // preserve findOption behavior for simple "key.prop" case
            const [, key, prop] = simpleMatch;
            const formDef = findFieldDefinition(key);
            const srcCtrl = (contextGroup as FormGroup | undefined)?.get?.(key) ?? props.formGroup?.get(key);
            const srcVal = srcCtrl?.value;
            if (prop && formDef?.findOption && srcVal !== undefined && srcVal !== null) {
              try {
                const option = await formDef.findOption(srcVal);
                if (option && prop in option) {
                  setIfChanged(option[prop]);
                  return;
                } else {
                  setIfChanged(null);
                  return;
                }
              } catch {
                setIfChanged(null);
                return;
              }
            } else {
              // fallback: set raw control value
              setIfChanged(srcVal ?? null);
              return;
            }
          }

          // generic expression
          const value = await evaluateExpressionAsync(expr, contextGroup);
          if (value === null) {
            // invalid or unsafe -> avoid setting Infinity/NaN. You can decide fallback (null or 0)
            // here we set null so the UI can choose how to display
            setIfChanged(null);
          } else {
            setIfChanged(value);
          }
        };

        if (parentGroup instanceof FormGroup) {
          const targetControl = parentGroup.get(formField.name);
          await applyToControl(targetControl, parentGroup);
        } else if (parentGroup instanceof FormArray) {
          // apply to each FormGroup item in the array
          parentGroup.controls.forEach((ctrl) => {
            if (ctrl instanceof FormGroup) {
              applyToControl(ctrl.get(formField.name), ctrl);
            }
          });
        }
      };

      // initial compute
      let recalcRunning = false;
      let recalcPending = false;
      const scheduleRecalc = () => {
        if (recalcRunning) {
          recalcPending = true;
          return;
        }
        recalcRunning = true;
        Promise.resolve(recalc()).finally(() => {
          recalcRunning = false;
          if (recalcPending) {
            recalcPending = false;
            scheduleRecalc();
          }
        });
      };
      scheduleRecalc();
      let arrayValueChangeSub: Subscription | null = null;
      const ensureArraySubscription = () => {
        if (arrayValueChangeSub || !(parentGroup instanceof FormArray)) return;
        const changes: any = (parentGroup as any).valueChanges;
        if (changes && typeof changes.subscribe === 'function') {
          const sub: any = changes.subscribe(() => scheduleRecalc());
          if (sub?.unsubscribe) {
            arrayValueChangeSub = sub as Subscription;
            subscriptions.push(arrayValueChangeSub);
          }
        }
      };
      ensureArraySubscription();
      // subscribe to root control changes
      roots.forEach((root) => {
        const sourceCtrl = props.formGroup?.get(root);
        if (sourceCtrl && 'valueChanges' in sourceCtrl) {
          const sub = sourceCtrl.valueChanges.subscribe(() => {
            scheduleRecalc();
          });
          subscriptions.push(sub);
        } else if (parentGroup instanceof FormArray) {
          ensureArraySubscription();
        }
      });
    };

    const walkLayout = (layout: BaseForm<string>[], group: FormGroup | FormArray) => {
      layout.forEach((formField) => {
        if (formField.controlType === 'form_group' && formField.name) {
          const nestedGroup = (group as FormGroup)?.get(formField.name) as FormGroup;
          if (nestedGroup && formField.formGroup) walkLayout(formField.formGroup, nestedGroup);
        } else if (formField.controlType === 'form_array' && formField.name) {
          const nestedArray = (group as FormGroup)?.get(formField.name) as FormArray;
          if (nestedArray && formField.formArray) walkLayout(formField.formArray, nestedArray);
        } else {
          processField(formField, group);
        }
      });
    };

    if (props.formGroup && props.formLayout) walkLayout(props.formLayout, props.formGroup);

    return () => {
      subscriptions.forEach((s) => {
        try {
          s.unsubscribe?.();
        } catch {
          //
        }
      });
    };
  }, [props.formGroup, props.formLayout]);

  return (
    <FieldGroup
      control={props.formGroup}
      render={() => {
        const rows = groupNodesByRow(props.formLayout);
        return (
          <>
            {rows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex flex-wrap w-full">
                {row.map((formField, index) => {
                  const matchValue = (
                    values: any[] | boolean | string,
                    criteriaValue: string | any
                  ) => {
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
                          className={`${getResponsiveWidthClass(formField.cols)} ${formField.altClass}`}
                        >
                          {hasCriteria(formField, props.formGroup) && (
                            <FormLayoutControl
                              formLayout={formField.formGroup}
                              formGroup={props.formGroup.get(formField.name)}
                              initValues={
                                formField.name &&
                                props.initValues &&
                                props.initValues[formField.name]
                              }
                            />
                          )}
                        </div>
                      );
                    case 'form_array':
                      return (
                        <div
                          key={index}
                          className={`px-3 ${getResponsiveWidthClass(formField.cols)} ${formField.altClass}`}
                        >
                          {hasCriteria(formField, props.formGroup) && (
                            <div className="form-array -mx-4">
                              <div className="px-4 mb-4">
                                <label className="text-md font-semibold">{formField.label}</label>
                              </div>
                              <FormTableControl
                                formField={formField}
                                formLayout={formField.formArray}
                                formArray={props.formGroup.get(formField.name) as FormArray}
                                initValues={
                                  (formField.name &&
                                    props.initValues &&
                                    props.initValues[formField.name]) ||
                                  []
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    default:
                      formField.submitted$ = props.submitted$;
                      return (
                        <div
                          key={index}
                          className={`px-3 ${getResponsiveWidthClass(formField.cols)} ${formField.altClass}`}
                        >
                          <FormField
                            formLayout={props.formLayout}
                            formField={formField}
                            formGroup={props.formGroup}
                          />
                        </div>
                      );
                  }
                })}
              </div>
            ))}
          </>
        );
      }}
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
