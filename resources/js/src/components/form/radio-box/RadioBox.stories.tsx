import { Meta, StoryObj } from '@storybook/react';
import { FormGroup } from 'react-reactive-form';
import { BaseForm } from '../base/base-form';
import { FormRadio } from '../base/form-radio';
import { FormRadioGroup } from '../base/form-radio-group';
import { RadioBoxGroup } from './RadioBoxGroup';
import { RadioCustom1 } from './RadioCustom1';
import { RadioCustom2 } from './RadioCustom2';
import { RadioCustom3 } from './RadioCustom3';

export default {
  title: 'Components/Form/Radio Group',
  component: RadioBoxGroup
} as Meta<typeof RadioBoxGroup>;

const formField = new FormRadioGroup({
  name: 'gender',
  handler: () => {
    return {
      value: 'male',
      type: 'radio'
    };
  },
  childs: [
    new FormRadio({
      label: 'Male',
      value: 'male'
    }),
    new FormRadio({
      label: 'Female',
      value: 'female'
    })
  ]
});

export const Default: StoryObj<typeof RadioBoxGroup> = {
  args: {
    ...formField
  }
};
