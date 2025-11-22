import { BaseForm } from '@/components/form/base/base-form';
import React from 'react';
import { createWorkflowField, WorkflowField } from './types';
import { FormLayout } from '@/components/form/FormLayout';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import { FormSubmit } from '@/components/form/base/form-submit';
import { useAuthContext } from '@/auth';

interface Props {
  formArray?: boolean;
  fields: BaseForm<string>[];
  roles: string[];
  onSubmit: (values: any, formGroup: FormGroup, submitted$: Subject<boolean>) => void;
  initialValues?: Record<string, any>;
}

const WorkflowForm: React.FC<Props> = ({ fields, roles, onSubmit, initialValues = {} }) => {
  const { currentUser } = useAuthContext();
  const hasRoleAccess = (): boolean => {
    const userRoles = currentUser?.roles ?? [];
    return userRoles.some((role: string) => roles.includes(role));
  };
  console.log(fields);
  const formLayout: BaseForm<string>[] = fields
    .filter((f) => f.type != 'hidden')
    .map((field) => createWorkflowField(field.type as any, field));

  formLayout.push(
    new FormSubmit({
      label: 'Submit & Continue',
      disabled: !hasRoleAccess()
    })
  );

  return <FormLayout initValues={initialValues} formLayout={formLayout} onSubmitForm={onSubmit} />;
};

export default WorkflowForm;
