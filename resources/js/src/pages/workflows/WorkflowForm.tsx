import { BaseForm } from '@/components/form/base/base-form';
import React from 'react';
import { createWorkflowField } from './types';
import { FormLayout } from '@/components/form/FormLayout';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import { FormSubmit } from '@/components/form/base/form-submit';

interface Props {
  fields: BaseForm<string>[];
  onSubmit: (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => void;
}

const WorkflowForm: React.FC<Props> = ({ fields, onSubmit }) => {
  const formLayout: BaseForm<string>[] = fields.map((field) => {
    return createWorkflowField(field.type as any, field);
  });
  formLayout.push(
    new FormSubmit({
      label: `Submit`,
      display: 'flex flex-col gap-1',
      altClass: 'flex',
      inputClass: 'flex justify-center'
    })
  );

  return <FormLayout initValues={{}} formLayout={formLayout} onSubmitForm={onSubmit} />;
};

export default WorkflowForm;
