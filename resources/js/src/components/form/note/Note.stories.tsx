import { Meta, StoryObj } from '@storybook/react';
import { FormNote } from '../base/form-note';
import { Note } from './Note';

export default {
  title: 'Components/Form/Note',
  component: Note
} as Meta<typeof Note>;

const formField = new FormNote({
  inputClass: 'bg-light-warning border-warning',
  label: 'We need your attention!',
  hint: `To start using great tools, please, please <a href="#" class="fw-bolder">Create Team Platform</a>`
});

export const Default: StoryObj<typeof Note> = {
  args: {
    ...formField
  }
};
