import { Meta, StoryObj } from '@storybook/react';
import { FormTitle } from '../base/form-title';
import { Title } from './Title';

export default {
  title: 'Components/Form/Title',
  component: Title
} as Meta<typeof Title>;

const formField = new FormTitle({
  label: 'Lorem Ipsum is simply dummy text.'
});

const Template: StoryObj<typeof Title> = {
  render: (args) => <Title {...args} />
};

export const Default: StoryObj<typeof Title> = {
  ...Template,
  args: {
    ...formField
  }
};
