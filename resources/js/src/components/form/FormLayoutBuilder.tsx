/* eslint-disable no-unused-vars */

import { Subject, Observable, of, from } from 'rxjs';
import {
  FormGroup,
  FieldArray,
  FormArray,
  AbstractControl,
  FieldGroup,
  Validators,
  Field
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { FormFieldPropertiesPanel } from './FormFieldPropertiesPanel';
import { MoveVertical, Plus, X } from 'lucide-react';
import { AddFormInputModal } from './AddFormInputModal';
import { KeenIcon } from '../keenicons';

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
  const [selectedField, setSelectedField] = useState<BaseForm<any> | null>(null);
  const [inputField, setInputField] = useState<BaseForm<any> | null>(null);
  const [openInputForm, setOpenInputForm] = useState(false);
  const [openProperiesPanel, setOpenProperiesPanel] = useState(false);

  const handleClose = () => {
    setOpenProperiesPanel(false);
    setOpenInputForm(false);
  };

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
    setInputField(field);
    setOpenInputForm(true);
  };

  const onRemoveField = (field: BaseForm<string>) => {
    setFormLayout((prev) => prev.filter((f) => f.unqKey !== field.unqKey));
  };

  return (
    <div className="flex flex-wrap -mx-4">
      <div className="w-2/3 flex flex-wrap px-4 space-y-4 p-4">
        <h3 className="text-lg font-semibold">{props.title ?? 'Form Builder'}</h3>
      </div>
      {/* <div className="w-1/3 flex flex-wrap px-4 space-y-4 p-4">
        <h3 className="text-lg font-semibold">Form Properties</h3>
      </div> */}

      <div className="w-full flex flex-wrap px-4 space-y-4 p-4 mb-auto">
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
                            // selectedField={selectedField}
                            // onClick={(field) => {
                            //   setSelectedField(field);
                            // }}
                            // onRemove={onRemoveField}
                            // onAdd={onAddField}
                          />
                        )}
                      </div>
                    );
                  //   case 'form_array':
                  //     return (
                  //       <div key={index} className={`w-full ${formField.altClass}`}>
                  //         {
                  //           <FieldGroup
                  //             control={formGroup}
                  //             render={(form: any) => {
                  //               return (
                  //                 <div className="form-array">
                  //                   <FormTableControl
                  //                     formField={formField}
                  //                     formLayout={formField.formArray}
                  //                     formArray={formGroup.get(formField.name) as FormArray}
                  //                     //   selectedField={selectedField}
                  //                     //   onClick={(field) => {
                  //                     //     setSelectedField(field);
                  //                     //   }}
                  //                     //   onRemove={onRemoveField}
                  //                     //   onAdd={onAddField}
                  //                     initValues={
                  //                       (props.initValues && props.initValues[formField.name]) || []
                  //                     }
                  //                   />
                  //                 </div>
                  //               );
                  //             }}
                  //           />
                  //         }
                  //       </div>
                  //     );
                  default:
                    return (
                      <SortableFormField
                        key={formField.unqKey}
                        id={formField.unqKey}
                        formGroup={formGroup}
                        formLayout={formLayout}
                        formField={formField}
                        selected={
                          (selectedField && selectedField.unqKey == formField.unqKey) || false
                        }
                        onClick={(field) => {
                          setSelectedField(field);
                          if (
                            field.controlType == 'form_group' ||
                            field.controlType == 'form_array'
                          )
                            setOpenInputForm(true);
                          else setOpenProperiesPanel(true);
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
            className="border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 font-semibold py-2 px-4 rounded"
          >
            Reset Form Layout
          </button>
        </div>
      </div>
      <Sheet open={openProperiesPanel} onOpenChange={handleClose}>
        <SheetContent
          className="border-0 p-0 w-[400px] scrollable-y-auto"
          forceMount={true}
          side="right"
          close={false}
        >
          <SheetHeader>
            <SheetTitle>
              <h3 className="text-lg font-semibold p-4">Form Properties</h3>
            </SheetTitle>
          </SheetHeader>
          <FormFieldPropertiesPanel
            onChange={(updated) => {
              setSelectedField(updated);

              setFormLayout((prev) =>
                prev.map((f) => (f.unqKey === updated.unqKey ? { ...f, ...updated } : f))
              );
            }}
            formField={selectedField}
          />
        </SheetContent>
      </Sheet>
      <AddFormInputModal
        open={openInputForm}
        initValue={selectedField}
        onAdded={(formField) => {
          const newField = {
            ...formField,
            unqKey: selectedField?.unqKey ?? uuid() // retain the same key for editing
          };

          setFormLayout((prev) => {
            const index = prev.findIndex((f) => f.unqKey === selectedField?.unqKey);

            if (index >= 0) {
              const updatedLayout = [...prev];
              updatedLayout[index] = newField;
              return updatedLayout;
            } else {
              return [...prev, newField];
            }
          });

          setSelectedField(null);
          setOpenInputForm(false);
        }}
        onOpenChange={() => {
          setOpenInputForm(false);
          setSelectedField(null);
        }}
      />
    </div>
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
              //   case 'form_group':
              //     return (
              //       <div
              //         key={index}
              //         className={`flex flex-wrap ${formField.columns} ${formField.altClass}`}
              //       >
              //         {hasCriteria(formField, props.formGroup) && (
              //           <FormLayoutControl
              //             formLayout={formField.formGroup}
              //             formGroup={props.formGroup.get(formField.name)}
              //             initValues={props.initValues && props.initValues[formField.name]}
              //           />
              //         )}
              //       </div>
              //     );
              //   case 'form_array':
              //     return (
              //       <div key={index} className={`w-full ${formField.altClass}`}>
              //         {hasCriteria(formField, props.formGroup) && (
              //           <div className="form-array">
              //             <FormTableControl
              //               formField={formField}
              //               formLayout={formField.formArray}
              //               formArray={props.formGroup.get(formField.name) as FormArray}
              //               initValues={(props.initValues && props.initValues[formField.name]) || []}
              //             />
              //           </div>
              //         )}
              //       </div>
              //     );
              default:
                formField.submitted$ = props.submitted$;
                return (
                  <div key={index} className={`${formField.columns}`}>
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

function SortableFormField({
  formLayout,
  formGroup,
  formField,
  id,
  selected,
  onClick,
  onRemove,
  onAdd
}: {
  formLayout: BaseForm<string>[];
  formGroup: FormGroup;
  formField: BaseForm<string>;
  id: string;
  selected: boolean;
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
        className={`py-2 px-8 border border-neutral-300 bg-white rounded shadow relative ${selected ? 'bg-white-100' : ''}`}
        style={{ minHeight: '56px' }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(formField);
        }}
      >
        {/* Top-right buttons */}
        <div className="absolute top-7 right-2 -translate-y-1/2 flex flex-col space-y-1 z-1">
          <button
            className="text-neutral-600 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation(); // prevent parent onClick
              onRemove(formField);
            }}
          >
            <X size={18} />
          </button>
          <button
            className="text-neutral-600 hover:text-green-500"
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
              case 'form_array':
                return (
                  <div className={`w-full flex flex-col gap-1 ${formField.altClass}`}>
                    {/* {hasCriteria(formField, props.formGroup) && ( */}
                    <label className="text-md font-semibold mb-4">{formField.label}</label>
                    <div className="form-array">
                      {/* Form Array */}
                      <FormTableControl
                        formField={formField}
                        formLayout={formField.formArray}
                        formArray={formGroup.get(formField.name) as FormArray}
                        initValues={[]}
                      />
                    </div>
                    {/* )} */}
                  </div>
                );
              case 'hidden':
                return <span className="text-md mt-2 flex items-center">Hidden Input</span>;
              case 'label':
              case 'sub_title':
              case 'checkbox':
              case 'radio':
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
};

export const FormTableControl = (props: IFormTableControl) => {
  return (
    <FieldArray
      key={uuid()}
      name={props.formField.name}
      render={({ controls }: FormArray | any) => {
        const addMore = () => {
          const formControl = toFormGroup(props.formLayout, {});
          formControl.meta = {
            key: uuid()
          };
          props.formArray.push(formControl);
        };

        const removeAt = (index: number) => {
          props.formArray.removeAt(index);
        };

        return (
          <div className={`grid ${props.formField.altClass}`}>
            {/* NON-TABLE RENDERING */}
            {!props.formField.useTable &&
              controls.map((formGroup: AbstractControl, index: number) => {
                return (
                  <div
                    className="flex items-center"
                    key={`${formGroup.meta?.key || uuid()}-${index}`}
                  >
                    <FormLayoutControl
                      formLayout={props.formLayout}
                      formGroup={formGroup}
                      initValues={props.initValues?.[index] || {}}
                    />
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

            {/* TABLE RENDERING */}
            {props.formField.useTable && (
              <div className="card min-w-full">
                <div className="card-table scrollable-x-auto">
                  <table className="table align-middle text-gray-700 font-medium text-sm">
                    <thead>
                      {props.formField.tableHeader ? (
                        props.formField.tableHeader.map((header: any[], index: number) => (
                          <tr
                            className="text-gray-500 font-semibold uppercase text-sm border-b"
                            key={`header-${index}`}
                          >
                            {header.map((th: any, thIdx: number) => (
                              <th
                                className="text-gray-700 px-3 py-2"
                                colSpan={th.colSpan}
                                rowSpan={th.rowSpan}
                                style={th.style}
                                key={`th-${thIdx}`}
                              >
                                {th.label}
                              </th>
                            ))}
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
                        ))
                      ) : (
                        <tr className="text-gray-500 font-semibold uppercase text-sm border-b">
                          {props.formLayout.map((field: BaseForm<string>, index: number) => (
                            <th
                              className={`px-3 py-2 ${field.columns}`}
                              style={field.style}
                              key={`auto-th-${index}`}
                            >
                              {field.label}
                            </th>
                          ))}
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
                      {controls.map((formGroup: AbstractControl | any, trIdx: number) => (
                        <tr key={`row-${trIdx}`} className="border-b">
                          <FieldGroup
                            control={formGroup}
                            render={() => (
                              <>
                                {props.formLayout.map((field: BaseForm<string>, tdIdx: number) => (
                                  <td
                                    className={`${field.columns} px-3 py-2`}
                                    style={field.style}
                                    key={`td-${trIdx}-${tdIdx}`}
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
                                ))}
                              </>
                            )}
                          />
                          {/* enable row deletion */}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!props.formField.useTable && !props.formField.readonly && (
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
