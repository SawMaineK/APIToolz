import { Meta, StoryObj } from '@storybook/react';
import { FormInput as Base } from '../base/form-input';
import { FormInputGroup } from './FormInputGroup';

export default {
  title: 'Components/Form/FormInputGroup',
  component: FormInputGroup
} as Meta<typeof FormInputGroup>;

const formField = new Base({
  name: 'name',
  label: 'Enter Name',
  required: true,
  hint: 'Hint text goes here'
});

const Template: StoryObj<typeof FormInputGroup> = {
  render: (args) => <FormInputGroup {...args} />
};

export const Default: StoryObj<typeof FormInputGroup> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {}
  }
};

export const IconInput: StoryObj<typeof FormInputGroup> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {},
    placeholder: 'Please enter name',
    prefixHtml: '<i class="ki-outline ki-user-square"></i>',
    endfix: '$'
  }
};

export const LabelInput: StoryObj<typeof FormInputGroup> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {},
    placeholder: 'Please enter name',
    display: 'y',
    tooltip: 'Hey, a delightful tooltip is here!'
  }
};
