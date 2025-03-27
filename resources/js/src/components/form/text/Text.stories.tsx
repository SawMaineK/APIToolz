import { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';
import { FormText } from '../base/form-text';

export default {
  title: 'Components/Form/Text',
  component: Text
} as Meta<typeof Text>;

// Define a default set of props for the Text component
const defaultFormText: FormText = new FormText({
  label:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  altClass: '',
  style: {}
});

// Define the default story
export const Default: StoryObj<typeof Text> = {
  args: defaultFormText
};
