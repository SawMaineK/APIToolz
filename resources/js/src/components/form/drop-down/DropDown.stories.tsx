import { Meta, StoryObj } from '@storybook/react';
import { FormSelect } from '../base/form-select';
import { DropDown } from './DropDown';

export default {
  title: 'Components/Form/DropDown',
  component: DropDown
} as Meta<typeof DropDown>;

const formField = new FormSelect({
  name: 'select',
  label: 'Select an option',
  placeholder: 'Choose one item',
  required: true,
  handler: () => {}
});

export const Default: StoryObj<typeof DropDown> = {
  args: {
    ...formField,
    options: [
      { id: 'foo', name: 'Foo' },
      { id: 'bar', name: 'Bar' }
    ],
    inputClass: 'border border-gray-300 rounded-lg px-4 py-2 w-full',
    altClass: 'mb-4'
  }
};

export const Multiple: StoryObj<typeof DropDown> = {
  args: {
    ...formField,
    options: [
      { id: 'foo', name: 'Foo' },
      { id: 'bar', name: 'Bar' }
    ],
    multiple: true,
    prefixHtml: '<i class="las la-user-alt text-lg"></i>',
    inputClass: 'border border-gray-300 rounded-lg px-4 py-2 w-full',
    altClass: 'mb-4'
  }
};

export const InputSolid: StoryObj<typeof DropDown> = {
  args: {
    ...formField,
    prefixHtml: '<i class="las la-user-alt text-lg"></i>',
    inputClass: 'border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 w-full',
    options: [
      { id: 'foo', name: 'Foo' },
      { id: 'bar', name: 'Bar' }
    ],
    altClass: 'mb-4'
  }
};

export const AsyncSelect: StoryObj<typeof DropDown> = {
  args: {
    ...formField,
    options$: async () => [
      { id: 'foo', name: 'Foo' },
      { id: 'bar', name: 'Bar' }
    ],
    multiple: true,
    prefixHtml: '<i class="las la-user-alt text-lg"></i>',
    inputClass: 'border border-gray-300 rounded-lg px-4 py-2 w-full',
    altClass: 'mb-4'
  }
};
