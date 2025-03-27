import { Meta, StoryObj } from '@storybook/react';
import { FormSeparator } from '../base/form-separator';
import { Separator } from './Separator';

const formField = new FormSeparator({});

export default {
  title: 'Components/Form/Separator',
  component: Separator
} as Meta<typeof Separator>;

const Template: StoryObj<typeof Separator> = {
  render: (args) => <Separator {...args} />
};

export const Default: StoryObj<typeof Separator> = {
  ...Template,
  args: {
    ...formField
  }
};
