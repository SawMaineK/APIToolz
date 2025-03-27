import { Meta, StoryObj } from '@storybook/react';
import { Coder } from './Coder';
import { FormCoder } from '../base/form-coder';

export default {
  title: 'Components/Form/Coder',
  component: Coder
} as Meta<typeof Coder>;

// Define the default args as a plain object
const defaultFormCoder: FormCoder = new FormCoder({
  name: 'code',
  label: 'Coder',
  handler: () => ({ value: '' }),
  altClass: '',
  style: {}
});

const Template: StoryObj<typeof Coder> = {
  args: defaultFormCoder
};

export const Default = Template;
