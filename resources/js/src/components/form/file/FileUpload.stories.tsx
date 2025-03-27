import { Meta, StoryObj } from '@storybook/react';
import { FormFile } from '../base/form-file';
import { FileUpload } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/Form/File Upload',
  component: FileUpload,
  args: {
    handler: () => {}
  }
};

export default meta;

const formField = new FormFile({
  name: 'image',
  label: 'File Upload',
  required: true
});

export const Default: StoryObj<typeof FileUpload> = {
  args: {
    ...formField
  }
};

export const InputGroup: StoryObj<typeof FileUpload> = {
  args: {
    ...formField,
    placeholder: 'Please enter name',
    endfixHtml: '<i class="las la-file-upload fs-1"></i>'
  }
};

export const InputSolid: StoryObj<typeof FileUpload> = {
  args: {
    ...formField,
    placeholder: 'Please enter name',
    endfixHtml: '<i class="las la-file-upload fs-1"></i>',
    inputClass: 'form-control-solid'
  }
};
