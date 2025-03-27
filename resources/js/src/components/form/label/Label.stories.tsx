import { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';
import { FormLabel } from '../base/form-label';

export default {
  title: 'Components/Form/Label',
  component: Label
} as Meta<typeof Label>;

const defaultFormField: FormLabel = new FormLabel({
  label: 'Label',
  altClass: 'custom-class',
  required: true,
  tooltip: 'This is some tooltip text.',
  hint: 'This is some hint text.',
  style: {}
});
// Create the default story
export const Default: StoryObj<typeof Label> = {
  args: defaultFormField
};
