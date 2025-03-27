import { BaseForm } from './base-form';

export class FormHidden extends BaseForm<string> {
    controlType = 'hidden';
    type= 'hidden';
}