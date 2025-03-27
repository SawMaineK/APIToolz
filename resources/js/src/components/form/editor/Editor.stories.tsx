import { Meta, StoryObj } from '@storybook/react';
import { FormInputEditor } from '../base/form-editor';
import { Editor } from './Editor';

const meta: Meta<typeof Editor> = {
  title: 'Components/Form/Editor',
  component: Editor
};

export default meta;

type Story = StoryObj<typeof Editor>;

const formField = new FormInputEditor({
  name: 'content',
  label: 'Content',
  handler: () => {
    return { value: '' };
  }
});

export const Default: Story = {
  args: {
    ...formField
  }
};
