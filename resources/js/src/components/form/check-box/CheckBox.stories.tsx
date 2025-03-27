import { Meta, StoryObj } from '@storybook/react';
import { CheckBox } from './CheckBox';
import { FormCheckBox } from '../base/form-checkbox';

export default {
  title: 'Components/Form/CheckBox',
  component: CheckBox
} as Meta<typeof CheckBox>;

// Define the default args as a plain object
const defaultFormCheckBox: FormCheckBox = new FormCheckBox({
  name: 'agree',
  label: 'Agree with us?',
  handler: () => {},
  hint: 'Checkbox for hint',
  tooltip: 'Tooltip is inportant',
  altClass: '',
  value: 'true',
  style: {}
});

const Template: StoryObj<typeof CheckBox> = {
  args: defaultFormCheckBox
};

export const Default = Template;
