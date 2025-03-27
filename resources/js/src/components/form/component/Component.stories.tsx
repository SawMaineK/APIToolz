import { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';
import { FormComponent } from '../base/form-component';

export default {
  title: 'Components/Form/Component',
  component: Component
} as Meta<typeof Component>;

// Default args for the FormComponent
const defaultFormField: FormComponent = new FormComponent({
  label: 'Custom Component'
});

const Template: StoryObj<typeof Component> = {
  args: {
    ...defaultFormField,
    handler: () => {}
  }
};

// Default Story
export const Default = Template;

// Custom Component Story
export const CustomComponent: StoryObj<typeof Component> = {
  args: {
    ...defaultFormField,
    handler: () => {},
    component: '<i className="las la-user-alt fs-1"></i>'
  }
};
