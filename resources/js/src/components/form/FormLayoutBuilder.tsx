/* eslint-disable no-unused-vars */

import { Subject, Observable, of, from } from 'rxjs';
import {
  FormGroup,
  FieldArray,
  FormArray,
  AbstractControl,
  FieldGroup,
  Validators
} from 'react-reactive-form';
import { BaseForm } from './base/base-form';
import { BaseFormArray } from './base/form-array';
import { BaseFormGroup } from './base/form-group';
import { FormField } from './FormField';
import React, { useEffect, useState } from 'react';
import { toFormGroup } from './FormLayout';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuid } from 'uuid';

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { FormFieldPropertiesPanel } from './FormFieldPropertiesPanel';
import { MoveVertical, Plus, X } from 'lucide-react';

export type IFormLayoutBuilder = {
  title: string;
  formLayout: BaseForm<string>[];
  initValues?: any;
  valiations?: Function | Function[] | any;
  onSaveFormLayout: (f: BaseForm<string>[]) => void;
  onResetFormLayout: () => void;
  onSubmitForm: (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => void;
  onResetForm?: (formGroup: FormGroup) => void;
};

export const FormLayoutBuilder = (props: IFormLayoutBuilder) => {
  const [formGroup, setFormGroup] = useState(toFormGroup(props.formLayout, props.initValues || {}));

  const [formLayout, setFormLayout] = useState<BaseForm<string>[]>(props.formLayout);
  const [selectedField, setSelectedField] = useState<BaseForm<any>>(formLayout[0]);

  useEffect(() => {
    const newFormGroup: FormGroup = toFormGroup(formLayout, props.initValues || {});
    newFormGroup.setValidators(props.valiations);
    setFormGroup(newFormGroup);
  }, [formLayout, props.initValues, props.valiations]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFormLayout((prevFormLayout) => {
        const oldIndex = prevFormLayout.findIndex((f) => f.unqKey === active.id);
        const newIndex = prevFormLayout.findIndex((f) => f.unqKey === over?.id);
        const newLayout = arrayMove([...prevFormLayout], oldIndex, newIndex);
        return [...newLayout]; // force new reference
      });
    }
  };

  const onAddField = (field: BaseForm<string>) => {
    const newField = { ...field, unqKey: uuid() };
    setFormLayout((prev) => {
      const index = prev.findIndex((f) => f.unqKey === field.unqKey);
      const updatedLayout = [...prev];
      updatedLayout.splice(index + 1, 0, newField);
      return updatedLayout;
    });
  };

  const onRemoveField = (field: BaseForm<string>) => {
    setFormLayout((prev) => prev.filter((f) => f.unqKey !== field.unqKey));
  };

  return (
    <div className="flex flex-wrap -mx-4">
      <div className="w-2/3 flex flex-wrap px-4 space-y-4 p-4">
        <h3 className="text-lg font-semibold">{props.title ?? 'Form Builder'}</h3>
      </div>
      <div className="w-1/3 flex flex-wrap px-4 space-y-4 p-4">
        <h3 className="text-lg font-semibold">Form Properties</h3>
      </div>

      <div className="w-2/3 flex flex-wrap px-4 space-y-4 p-4 mb-auto">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={formLayout.map((f) => f.unqKey)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mb-auto flex flex-wrap gap-x-0 gap-y-2 w-full">
              {formLayout.map((formField: BaseForm<string>, index: number) => {
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
                        className={`flex flex-wrap ${formField.columns} ${formField.altClass}`}
                      >
                        {hasCriteria(formField, formGroup) && (
                          <FormLayoutControl
                            formLayout={formField.formGroup}
                            formGroup={formGroup.get(formField.name)}
                            initValues={props.initValues && props.initValues[formField.name]}
                            onClick={(field) => {
                              setSelectedField(field);
                            }}
                            onRemove={onRemoveField}
                            onAdd={onAddField}
                          />
                        )}
                      </div>
                    );
                  case 'form_array':
                    return (
                      <div key={index} className={`w-full ${formField.altClass}`}>
                        {hasCriteria(formField, formGroup) && (
                          <div className="form-array">
                            <FormTableControl
                              formField={formField}
                              formLayout={formField.formArray}
                              formArray={formGroup.get(formField.name) as FormArray}
                              onClick={(field) => {
                                setSelectedField(field);
                              }}
                              onRemove={onRemoveField}
                              onAdd={onAddField}
                              initValues={
                                (props.initValues && props.initValues[formField.name]) || []
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  default:
                    return (
                      <SortableFormField
                        key={formField.unqKey}
                        id={formField.unqKey}
                        formGroup={formGroup}
                        formLayout={formLayout}
                        formField={formField}
                        onClick={(field) => {
                          setSelectedField(field);
                        }}
                        onRemove={onRemoveField}
                        onAdd={onAddField}
                      ></SortableFormField>
                    );
                }
              })}
            </div>
          </SortableContext>
        </DndContext>
        <div className="mt-4 flex space-x-4 h-10">
          <button
            onClick={() => {
              props.onSaveFormLayout(formLayout);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Save Form Layout
          </button>
          <button
            onClick={() => {
              props.onResetFormLayout();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Reset Form Layout
          </button>
        </div>
      </div>
      <div className="w-1/3">
        <FormFieldPropertiesPanel
          formField={selectedField}
          onChange={(updated) => {
            setSelectedField(updated);

            setFormLayout((prev) =>
              prev.map((f) => (f.unqKey === updated.unqKey ? { ...f, ...updated } : f))
            );
          }}
        />
      </div>
    </div>
  );
};

interface IFormLayoutControl {
  formLayout: BaseForm<string>[];
  formGroup: FormGroup | any;
  initValues?: any;
  submitted$?: any;
  onClick: (field: BaseForm<string>) => void;
  onRemove: (field: BaseForm<string>) => void;
  onAdd: (field: BaseForm<string>) => void;
}
export const FormLayoutControl = (props: IFormLayoutControl) => {
  return (
    <FieldGroup
      key={uuid()}
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
                        onClick={props.onClick}
                        onRemove={props.onRemove}
                        onAdd={props.onAdd}
                      />
                    )}
                  </div>
                );
              case 'form_array':
                return (
                  <div key={index} className={`w-full ${formField.altClass}`}>
                    {hasCriteria(formField, props.formGroup) && (
                      <div className="form-array">
                        <FormTableControl
                          formField={formField}
                          formLayout={formField.formArray}
                          formArray={props.formGroup.get(formField.name) as FormArray}
                          initValues={(props.initValues && props.initValues[formField.name]) || []}
                          onClick={props.onClick}
                          onRemove={props.onRemove}
                          onAdd={props.onAdd}
                        />
                      </div>
                    )}
                  </div>
                );
              default:
                formField.submitted$ = props.submitted$;
                return (
                  <SortableFormField
                    key={formField.unqKey}
                    id={formField.unqKey}
                    formGroup={props.formGroup}
                    formLayout={props.formLayout}
                    formField={formField}
                    onClick={props.onClick}
                    onRemove={props.onRemove}
                    onAdd={props.onAdd}
                  ></SortableFormField>
                );
            }
          })}
        </>
      )}
    />
  );
};

function SortableFormField({
  formLayout,
  formGroup,
  formField,
  id,
  onClick,
  onRemove,
  onAdd
}: {
  formLayout: BaseForm<string>[];
  formGroup: FormGroup;
  formField: BaseForm<string>;
  id: string;
  onClick: (formField: BaseForm<string>) => void;
  onRemove: (formField: BaseForm<string>) => void;
  onAdd: (formField: BaseForm<string>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative ${formField.columns}`}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move z-1"
      >
        <MoveVertical size={18} />
      </div>

      {/* Content Container */}
      <div
        className="py-2 px-8 border border-gray-300 bg-white rounded shadow relative"
        style={{ minHeight: '56px' }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(formField);
        }}
      >
        {/* Top-right buttons */}
        <div className="absolute top-7 right-2 -translate-y-1/2 flex flex-col space-y-1 z-1">
          <button
            className="text-gray-600 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation(); // prevent parent onClick
              onRemove(formField);
            }}
          >
            <X size={18} />
          </button>
          <button
            className="text-gray-600 hover:text-green-500"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(formField);
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Actual field */}
        <FieldGroup
          key={uuid()}
          control={formGroup}
          render={() => {
            switch (formField.controlType) {
              case 'hidden':
                return <span className="text-md mt-2 flex items-center">Hidden Input</span>;
              case 'label':
                return (
                  <div className="mt-2 flex items-center">
                    <FormField
                      formLayout={formLayout}
                      formField={formField}
                      formGroup={formGroup}
                    />
                  </div>
                );
              default:
                return (
                  <FormField formLayout={formLayout} formField={formField} formGroup={formGroup} />
                );
            }
          }}
        />
      </div>
    </div>
  );
}
type IFormTableControl = {
  formField: BaseForm<string>;
  formLayout: BaseForm<string>[];
  formArray: FormArray;
  initValues?: any;
  onClick: (field: BaseForm<string>) => void;
  onRemove: (field: BaseForm<string>) => void;
  onAdd: (field: BaseForm<string>) => void;
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

        const removeAt = (index: number) => {
          props.formArray.removeAt(index);
        };
        return (
          <div className={`grid px-4 ${props.formField.altClass}`}>
            {!props.formField.useTable &&
              controls.map((formGroup: AbstractControl, index: number) => {
                return (
                  <div
                    className="flex items-center space-x-4 mb-4"
                    key={`${formGroup.meta.key}-${String(index)}`}
                  >
                    <FormLayoutControl
                      formLayout={props.formLayout}
                      formGroup={formGroup}
                      initValues={props.initValues[index] || {}}
                      onClick={props.onClick}
                      onRemove={props.onRemove}
                      onAdd={props.onAdd}
                    />
                    {!props.formField.readonly && (
                      <button
                        onClick={() => removeAt(index)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                        type="button"
                      >
                        <i className="las la-minus-circle text-2xl"></i>
                      </button>
                    )}
                  </div>
                );
              })}

            {props.formField.useTable && (
              <div className="card min-w-full">
                <div className="card-table scrollable-x-auto">
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
                            </tr>
                          );
                        })}
                      {!props.formField.tableHeader && (
                        <tr className="text-gray-500 font-semibold uppercase text-sm border-b">
                          {props.formLayout.map((field: BaseForm<string>, index: number) => {
                            return (
                              <th
                                className={`px-3 py-2 ${field.columns}`}
                                style={field.style}
                                key={index}
                              >
                                {field.label}
                              </th>
                            );
                          })}
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {controls.map((formGroup: AbstractControl | any, trIdx: number) => {
                        return (
                          <tr key={trIdx} className="border-b">
                            <FieldGroup
                              key={uuid()}
                              control={formGroup}
                              render={() => (
                                <>
                                  {props.formLayout.map(
                                    (field: BaseForm<string>, tdIdx: number) => {
                                      return (
                                        <td
                                          className={`${field.columns} px-3 py-2`}
                                          style={field.style}
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
                              <button
                                onClick={() => removeAt(trIdx)}
                                className="text-red-600 hover:text-red-800 focus:outline-none ml-2"
                                type="button"
                              >
                                <i className="las la-minus-circle text-2xl"></i>
                              </button>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!props.formField.readonly && (
              <div className="py-4 text-right">
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
