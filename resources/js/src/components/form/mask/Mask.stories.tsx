import { Meta, StoryObj } from '@storybook/react';
import { FormInputMask } from '../base/form-input-mask';
import { Mask } from './Mask';

export default {
  title: 'Components/Form/Mask',
  component: Mask
} as Meta<typeof Mask>;

const formField = new FormInputMask({
  name: 'mask',
  label: 'Input Mask',
  mask: '99-99-9999',
  required: true
});

export const Default: StoryObj<typeof Mask> = {
  args: {
    ...formField,
    handler: () => {},
  },
};

export const InputGroup: StoryObj<typeof Mask> = {
  args: {
    ...formField,
    handler: () => {},
    prefixHtml: '<i class="las la-user-alt fs-1"></i>',
  }
};

export const InputSolid: StoryObj<typeof Mask> = {
  args: {
    ...formField,
    handler: () => {},
    prefixHtml: '<i class="las la-user-alt fs-1"></i>',
    inputClass: 'form-control-solid'
  }
};
