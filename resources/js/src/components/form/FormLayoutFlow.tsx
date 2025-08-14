import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  useEdgesState,
  Node,
  Edge,
  addEdge,
  Connection,
  NodeChange,
  applyNodeChanges,
  NodeResizer,
  NodeProps,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Subject } from 'rxjs';
import { FieldGroup, FormArray, FormGroup, Validators } from 'react-reactive-form';
import { BaseForm } from './base/base-form';
import { FormField } from './FormField';
import { Alert } from '@/components';
import { FormLayoutControl, FormTableControl, IFormLayout, toFormGroup } from './FormLayout';
import { BaseFormGroup } from './base/form-group';
import { BaseFormArray } from './base/form-array';
import { AddFormInputModal } from './AddFormInputModal';
import { FormFieldPropertiesPanel } from './FormFieldPropertiesPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { v4 as uuid } from 'uuid';
import { Edit, Play, Save, Trash } from 'lucide-react';
import { IFormLayoutBuilder } from './FormLayoutBuilder';

const LOCAL_STORAGE_KEY = 'formLayoutFlowNodePositions';
const LOCAL_STORAGE_MODE_KEY = 'formLayoutFlowMode';

const parentWidthDefault = 900; // max container width

// ✅ Snap helper for Tailwind cols
const snapWidthToCols = (width: number, parentWidth: number) => {
  const full = parentWidth;
  const half = parentWidth / 2;
  const third = parentWidth / 3;
  const quarter = parentWidth / 4;

  const options = [
    { cols: 1, width: full },
    { cols: 2, width: half },
    { cols: 3, width: third },
    { cols: 4, width: quarter }
  ];

  let best = options[0];
  let minDiff = Math.abs(width - best.width);
  for (let opt of options) {
    const diff = Math.abs(width - opt.width);
    if (diff < minDiff) {
      best = opt;
      minDiff = diff;
    }
  }

  return best; // returns {cols, width}
};

// ✅ Responsive Tailwind classes for Form Mode
const getResponsiveWidthClass = (cols?: number) => {
  // always full on mobile
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

// ✅ Group nodes into rows by Y position
const groupNodesByRow = (nodes: Node[], tolerance = 50) => {
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);
  const rows: Node[][] = [];
  let currentRow: Node[] = [];
  let lastY: number | null = null;

  sorted.forEach((node) => {
    if (lastY === null || Math.abs(node.position.y - lastY) < tolerance) {
      currentRow.push(node);
      lastY = lastY === null ? node.position.y : Math.min(lastY, node.position.y);
    } else {
      rows.push([...currentRow]);
      currentRow = [node];
      lastY = node.position.y;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  // sort horizontally
  rows.forEach((row) => row.sort((a, b) => a.position.x - b.position.x));
  return rows;
};

type FormFieldNodeProps = NodeProps & {
  handleEditField: (fieldId: string) => void;
  handleRemoveField: (fieldId: string) => void;
};

const FormFieldNode: React.FC<FormFieldNodeProps> = ({
  data,
  selected,
  handleEditField,
  handleRemoveField
}) => {
  const parentWidth = parentWidthDefault;

  const field = (data?.field ?? {}) as BaseForm<string>;
  const currentCols = field.cols ?? 2; // default start at 2 cols
  const currentWidth = parentWidth / currentCols;

  const handleDoubleClick = () => {
    let newCols = (currentCols % 4) + 1;
    field.cols = newCols;
    field.width = parentWidth / newCols;
  };

  return (
    <div
      style={{ width: currentWidth }}
      className="border p-2 rounded shadow bg-white relative cursor-pointer transition-all"
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        color="#3b82f6"
        isVisible={selected}
        minWidth={parentWidth / 4}
        maxWidth={parentWidth}
        onResizeEnd={(_, node) => {
          const snapped = snapWidthToCols(node.width ?? currentWidth, parentWidth);
          field.cols = snapped.cols;
          field.width = snapped.width;
        }}
      />
      <strong>{field.label || 'Untitled Field'}</strong>
      <div className="text-xs text-gray-500">
        {field.controlType} → <b>{currentCols} cols</b>
      </div>
      <div className="absolute bottom-1 right-2 text-xs text-gray-400">
        (Double-click to auto resize)
      </div>
      <div
        className="absolute top-1 right-8 text-blue-500 cursor-pointer"
        onClick={() => handleEditField(field.unqKey)}
      >
        <Edit size={16} />
      </div>
      <div
        className="absolute top-1 right-1 text-red-500 cursor-pointer"
        onClick={() => handleRemoveField(field.unqKey)}
      >
        <Trash size={16} />
      </div>
    </div>
  );
};

const nodeTypes = {
  formFieldNode: (nodeProps: NodeProps) => (
    <FormFieldNode
      {...nodeProps}
      handleEditField={(window as any).__formLayoutFlowHandleEditField}
      handleRemoveField={(window as any).__formLayoutFlowHandleRemoveField}
    />
  )
};

export const FormLayoutFlow = (props: IFormLayoutBuilder) => {
  const [formGroup, setFormGroup] = useState<FormGroup | null>(null);
  const [submitted$, setSubmitted$] = useState<Subject<boolean> | null>(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedField, setSelectedField] = useState<BaseForm<string> | null>(null);
  const [editField, setEditField] = useState<BaseForm<string> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  (window as any).__formLayoutFlowHandleEditField = (fieldId: string) => handleEditField(fieldId);
  (window as any).__formLayoutFlowHandleRemoveField = (fieldId: string) =>
    handleRemoveField(fieldId);

  const initialMode =
    (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_MODE_KEY)) || 'builder';
  const [mode, setMode] = useState<'builder' | 'form'>(initialMode as 'builder' | 'form');

  const loadSavedLayout = useCallback(
    (formLayout: BaseForm<string>[], group: FormGroup) => {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}-${props.title.replace(/\s+/g, '')}`);
      let savedPositions: Record<string, { x: number; y: number; cols?: number }> = {};

      if (saved) {
        try {
          savedPositions = JSON.parse(saved);
        } catch {
          // If parsing fails, build from props.formLayout
        }
      } else {
        savedPositions = props.formLayout.reduce(
          (
            acc: Record<string, { x: number; y: number; cols?: number }>,
            form: any,
            idx: number
          ) => {
            acc[form.unqKey] = {
              x: form.position?.x || 50,
              y: form.position?.y || idx * 80,
              cols: form.cols
            };
            return acc;
          },
          {}
        );
      }

      const isLargeScreen = window.innerWidth > 1440;
      const defaultCols = isLargeScreen ? 3 : 2;

      return formLayout.map((field, idx) => {
        const id = field.unqKey ?? `node-${idx}`;
        const savedNode = savedPositions[id];
        const cols = savedNode?.cols ?? defaultCols;
        const position = savedNode ? { x: savedNode.x, y: savedNode.y } : { x: 50, y: idx * 80 };

        return {
          id,
          type: 'formFieldNode',
          position,
          data: {
            field: {
              ...field,
              cols,
              position
            }
          }
        } as Node;
      });
    },
    [props.title, props.formLayout]
  );

  // ✅ Init on mount
  useEffect(() => {
    const submittedSubject = new Subject<boolean>();
    const newFormGroup = toFormGroup(props.formLayout, props.initValues || {});
    newFormGroup.setValidators(props.valiations);

    setFormGroup(newFormGroup);
    setSubmitted$(submittedSubject);
    setNodes(loadSavedLayout(props.formLayout, newFormGroup));
  }, [props.formLayout, loadSavedLayout]);

  const handleNodesChange = (changes: NodeChange[]) => {
    setNodes((prev) => {
      const updated = applyNodeChanges(changes, prev);

      const positionsToSave: Record<string, { x: number; y: number; cols?: number }> = {};
      updated.forEach((n) => {
        const cols = n.data?.field?.cols ?? 2;
        positionsToSave[n.id] = { x: n.position.x, y: n.position.y, cols };
        if (n.data?.field) {
          n.data.field.position = n.position;
          n.data.field.cols = cols;
        }
      });

      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}-${props.title.replace(/\s+/g, '')}`,
        JSON.stringify(positionsToSave)
      );
      return updated;
    });
  };

  const handleAddField = (afterId?: string) => {
    setEditField(null);
    setSelectedField(nodes.find((n) => n.id === afterId)?.data?.field || null);
    setShowModal(true);
  };

  const handleEditField = (fieldId: string) => {
    const node = nodes.find((n) => n.id === fieldId);
    console.log('Editing field:', node?.data?.field);
    setEditField(node?.data?.field || null);
    setShowPropertiesPanel(true);
  };

  const handleRemoveField = (fieldId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== fieldId));
  };

  const handleSubmit = () => {
    if (!formGroup || !submitted$) return;
    formGroup.markAsSubmitted();
    if (formGroup.valid) {
      submitted$.next(false);
      props.onSubmitForm(formGroup.value, formGroup, submitted$);
    }
  };

  const handleReset = () => {
    if (!formGroup) return;
    formGroup.reset(props.initValues, {});
    props.onResetForm && props.onResetForm(formGroup);
  };

  const handleSaveLayout = () => {
    const updatedLayout: any[] = nodes.map((n) => ({
      ...(n.data.field as BaseForm<string>),
      unqKey: n.id,
      position: n.position,
      cols: n.data.field.cols
    }));
    props.onSaveFormLayout && props.onSaveFormLayout(updatedLayout);
  };

  const handleResetLayoutPositions = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}-${props.title.replace(/\s+/g, '')}`);
    if (formGroup) setNodes(loadSavedLayout(props.formLayout, formGroup));
  };

  const switchMode = (newMode: 'builder' | 'form') => {
    setMode(newMode);
    localStorage.setItem(LOCAL_STORAGE_MODE_KEY, newMode);
  };

  if (!formGroup) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          {mode === 'builder' ? (
            <Edit className="text-purple-500" size={22} />
          ) : (
            <Edit className="text-blue-500" size={22} />
          )}
          <h2 className="text-lg font-semibold">
            {mode === 'builder' ? 'Layout Builder' : 'Form View'}
          </h2>
        </div>
        <div className="flex gap-2">
          {mode === 'builder' ? (
            <>
              <button
                onClick={() => handleAddField()}
                className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded shadow transition"
              >
                <Edit size={16} className="inline" />
                Add Field
              </button>
              <button
                onClick={handleSaveLayout}
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow transition"
              >
                <Save size={16} className="inline" />
                Save Layout
              </button>
              <button
                onClick={() => switchMode('form')}
                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow transition"
              >
                <Play size={16} className="inline" />
                Switch to Form
              </button>
              <button
                onClick={handleResetLayoutPositions}
                className="flex items-center gap-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded shadow transition"
              >
                <Trash size={16} className="inline" />
                Reset Positions
              </button>
            </>
          ) : (
            <button
              onClick={() => switchMode('builder')}
              className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded shadow transition"
            >
              <Edit size={16} className="inline" />
              Back to Builder
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {mode === 'builder' ? (
        // ✅ Builder Mode
        <div className="flex flex-col h-[100vh]">
          <div className="flex-1 overflow-auto p-4">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={(params: Edge | Connection) => setEdges((eds) => addEdge(params, eds))}
              nodeTypes={nodeTypes}
              selectionOnDrag
              multiSelectionKeyCode={['Shift']} // optional: allow Shift + Click multi-select
              panOnDrag
              zoomOnScroll={false}
              snapToGrid={false}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            >
              <Background />
            </ReactFlow>
          </div>
        </div>
      ) : (
        // ✅ Form Mode
        <FieldGroup
          control={formGroup}
          render={(form) => {
            const rows = groupNodesByRow(nodes);
            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                onReset={(e) => {
                  e.preventDefault();
                  handleReset();
                }}
                noValidate
                className="flex-1 overflow-auto p-4"
              >
                {form.hasError('submit') && (
                  <Alert variant="danger">{form.getError('submit')}</Alert>
                )}
                {rows.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="flex flex-wrap -mx-2 w-full">
                    {row.map((node, index) => {
                      const formField = node.data.field as BaseForm<string>;
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
                            matchValue(
                              form.criteriaValue.value,
                              group.value[form.criteriaValue.key]
                            )
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
                              {formField.name && hasCriteria(formField, formGroup) && (
                                <FormLayoutControl
                                  formLayout={formField.formGroup}
                                  formGroup={formGroup.get(formField.name)}
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
                              {formField.name && hasCriteria(formField, formGroup) && (
                                <div className="form-array">
                                  <div className="mb-4">
                                    <label className="text-md font-semibold">
                                      {formField.label}
                                    </label>
                                  </div>
                                  <div className="-mx-4">
                                    <FormTableControl
                                      formField={formField}
                                      formLayout={formField.formArray}
                                      formArray={formGroup.get(formField.name) as FormArray}
                                      initValues={
                                        (formField.name &&
                                          props.initValues &&
                                          props.initValues[formField.name]) ||
                                        []
                                      }
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        default:
                          //formField.submitted$ = submitted$;
                          return (
                            <div
                              key={index}
                              className={`px-3 ${getResponsiveWidthClass(formField.cols)} ${formField.altClass}`}
                            >
                              <FormField
                                formLayout={props.formLayout}
                                formField={formField}
                                formGroup={formGroup}
                              />
                            </div>
                          );
                      }
                    })}
                  </div>
                ))}
              </form>
            );
          }}
        />
      )}
      <Sheet open={showPropertiesPanel} onOpenChange={() => setShowPropertiesPanel(false)}>
        <SheetContent side="right" className="w-[400px] p-0 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="p-4">Edit Field Properties</SheetTitle>
          </SheetHeader>
          <FormFieldPropertiesPanel
            formField={editField}
            onChange={(updated) => {
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === updated.unqKey ? { ...n, data: { ...n.data, field: updated } } : n
                )
              );
              setEditField(updated);
            }}
          />
        </SheetContent>
      </Sheet>

      <AddFormInputModal
        open={showModal}
        initValue={editField}
        onAdded={(newField) => {
          const unqKey = editField?.unqKey ?? uuid();
          const newNode: Node = {
            id: unqKey,
            type: 'formFieldNode',
            position: { x: 100, y: 100 }, // Default position
            data: { field: { ...newField, unqKey } }
          };

          setNodes((prev) => {
            if (editField) {
              return prev.map((n) => (n.id === unqKey ? newNode : n));
            } else if (selectedField) {
              const index = prev.findIndex((n) => n.id === selectedField.unqKey);
              const updated = [...prev];
              updated.splice(index + 1, 0, newNode);
              return updated;
            } else {
              return [...prev, newNode];
            }
          });

          setSelectedField(null);
          setShowModal(false);
        }}
        onOpenChange={() => {
          setShowModal(false);
          setSelectedField(null);
        }}
      />
    </div>
  );
};
