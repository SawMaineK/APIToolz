import { BaseForm } from './base-form';

export class FormCheckBox extends BaseForm<boolean | string> {
  controlType = 'checkbox';
  type = 'checkbox';
}
