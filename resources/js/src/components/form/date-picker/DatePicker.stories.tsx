import { Meta, StoryObj } from '@storybook/react';
import { FormDateTime } from '../base/form-datetime';
import { DatePicker } from './DatePicker';

export default {
  title: 'Components/Form/DatePicker',
  component: DatePicker
} as Meta<typeof DatePicker>;

const formField = new FormDateTime({
  name: 'datetime',
  label: 'Date Time',
  placeholder: 'Click to pick datetime',
  required: true,
  handler: () => {}
});

const Template: StoryObj<typeof DatePicker> = {
  render: (args) => <DatePicker {...args} />,
  args: {
    ...formField
  }
};

export const Default = Template;

export const InputSolid: StoryObj<typeof DatePicker> = {
  ...Template,
  args: {
    ...formField,
    prefixHtml: '<i className="las la-calendar fs-1"></i>',
    inputClass: 'form-control-solid'
  }
};
