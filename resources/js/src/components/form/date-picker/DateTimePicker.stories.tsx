import { Meta, StoryObj } from '@storybook/react';
import { FormDateTime } from '../base/form-datetime';
import { DateTimePicker } from './DateTimePicker';

export default {
  title: 'Components/Form/DateTimePicker',
  component: DateTimePicker
} as Meta<typeof DateTimePicker>;

const formField = new FormDateTime({
  name: 'datetime',
  label: 'Date Time',
  placeholder: 'Click to pick datetime',
  required: true,
  handler: () => {}
});

const Template: StoryObj<typeof DateTimePicker> = {
  render: (args) => <DateTimePicker {...args} />,
  args: {
    ...formField
  }
};

export const Default: StoryObj<typeof DateTimePicker> = Template;

export const InputSolid: StoryObj<typeof DateTimePicker> = {
  ...Template,
  args: {
    ...formField,
    prefixHtml: '<i className="las la-calendar fs-1"></i>',
    inputClass: 'form-control-solid'
  }
};
