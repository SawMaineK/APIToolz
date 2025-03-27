import { Meta, StoryObj } from '@storybook/react';
import { FormTextArea } from '../base/form-textarea';
import { TextArea } from './TextArea';

const formField = new FormTextArea({
  name: 'description',
  label: 'Description',
  defaultLength: 3,
  required: true,
  handler: () => {}
});

export default {
  title: 'Components/Form/TextArea',
  component: TextArea
} as Meta<typeof TextArea>;

export const Default: StoryObj<typeof TextArea> = {
  args: {
    ...formField
  }
};

export const Label: StoryObj<typeof TextArea> = {
  args: {
    ...formField,
    altClass: 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5'
  }
};

export const hint: StoryObj<typeof TextArea> = {
  args: {
    ...formField,
    altClass: 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5',
    hint: 'Hint text goes here'
  }
};
