import { Meta, StoryObj } from '@storybook/react';
import { FormSwitch } from '../base/form-switch';
import { Switch } from './Switch';

export default {
  title: 'Components/Form/Switch',
  component: Switch
} as Meta<typeof Switch>;

const formField = new FormSwitch({
  name: 'switch',
  label: 'Switch',
  handler: () => {}
});

export const Default: StoryObj<typeof Switch> = {
  args: {
    ...formField
  }
};
