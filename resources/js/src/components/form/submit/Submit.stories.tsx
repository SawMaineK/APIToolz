import { Meta, StoryObj } from '@storybook/react';
import { FormSubmit } from '../base/form-submit';
import { Submit } from './Submit';

export default {
  title: 'Components/Form/Submit',
  component: Submit
} as Meta<typeof Submit>;

const formField = new FormSubmit({
  label: 'Submit'
});

const Template: StoryObj<typeof Submit> = {
  render: (args) => <Submit {...args} />
};

export const Default: StoryObj<typeof Submit> = {
  ...Template,
  args: {
    ...formField
  }
};

export const IconButton: StoryObj<typeof Submit> = {
  ...Template,
  args: {
    ...formField,
    endfixHtml: `<i class="las la-download fs-1 ms-3"></i>`
  }
};
