import { Meta, StoryObj } from '@storybook/react';
import { FormReset } from '../base/form-reset';
import { Reset } from './Reset';

const formField = new FormReset({
  label: 'Reset'
});

export default {
  title: 'Components/Form/Reset',
  component: Reset
} as Meta<typeof Reset>;

export const Default: StoryObj<typeof Reset> = {
  args: {
    ...formField
  }
};
