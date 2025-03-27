import { Meta, StoryObj } from '@storybook/react';
import { FormInput as Base } from '../base/form-input';
import { FormInput } from './FormInput';

export default {
  title: 'Components/Form/FormInput',
  component: FormInput
} as Meta<typeof FormInput>;

const formField = new Base({
  name: 'name',
  label: 'Enter Name',
  required: true,
  hint: 'Hint text goes here'
});

const Template: StoryObj<typeof FormInput> = {
  render: (args) => <FormInput {...args} />
};

export const Default: StoryObj<typeof FormInput> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {}
  }
};

export const IconInput: StoryObj<typeof FormInput> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {},
    placeholder: 'Please enter name',
    prefixHtml: '<i class="ki-outline ki-user-square"></i>',
    endfix: '$'
  }
};

export const TooltipInput: StoryObj<typeof FormInput> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {},
    placeholder: 'Please enter name',
    prefixHtml: '<i class="ki-outline ki-user-square"></i>',
    tooltip: 'Hey, a delightful tooltip is here!'
  }
};

export const CustomLabel: StoryObj<typeof FormInput> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {},
    placeholder: 'Please enter name',
    display: 'y',
    tooltip: 'Hey, a delightful tooltip is here!'
  }
};
