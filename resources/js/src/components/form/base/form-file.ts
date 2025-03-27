import { BaseForm } from './base-form';

export class FormFile extends BaseForm<string> {
    controlType = 'file';
}