import { Meta, StoryObj } from '@storybook/react';
import { FormInput } from '../base/form-input';
import { TextBox } from './TextBox';

export default {
  title: 'Components/Form/TextBox',
  component: TextBox
} as Meta<typeof TextBox>;

const formField = new FormInput({
  name: 'name',
  label: 'Enter Name',
  required: true,
  hint: 'Hint text goes here'
});

const Template: StoryObj<typeof TextBox> = {
  render: (args) => <TextBox {...args} />
};

export const Default: StoryObj<typeof TextBox> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {}
  }
};

export const IconInput: StoryObj<typeof TextBox> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {},
    placeholder: 'Please enter name',
    prefixHtml: '<i class="ki-outline ki-user-square"></i>',
    endfix: '$'
  }
};

export const CustomLabel: StoryObj<typeof TextBox> = {
  ...Template,
  args: {
    ...formField,
    handler: () => {},
    placeholder: 'Please enter name',
    display: 'y',
    prefixHtml: '<i class="ki-outline ki-user-square"></i>',
    endfix: '$'
  }
};
