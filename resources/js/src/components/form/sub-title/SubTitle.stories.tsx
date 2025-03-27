import { Meta, StoryObj } from '@storybook/react';
import { FormSubTitle } from '../base/form-sub-title';
import { SubTitle } from './SubTitle';

export default {
  title: 'Components/Form/Sub Title',
  component: SubTitle
} as Meta<typeof SubTitle>;

const formField = new FormSubTitle({
  label: 'Lorem Ipsum is simply dummy text.'
});

export const Default: StoryObj<typeof SubTitle> = {
  args: {
    ...formField
  }
};
