import { BaseForm } from './base-form';

export class FormSwitch extends BaseForm<boolean|string> {
    controlType = 'switch';
}