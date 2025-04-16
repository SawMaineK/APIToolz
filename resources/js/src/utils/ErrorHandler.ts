import axios from 'axios';
import { FormGroup } from 'react-reactive-form';

export const handleFormError = (error: any, formGroup: FormGroup) => {
  console.error('Form submission failed:', error);

  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    // Set a general submit error
    formGroup.setErrors({ submit: data.message });

    // Handle field-specific errors for 400 status
    if (data.errors && status === 400) {
      Object.entries(data.errors).forEach(([field, messages]) => {
        const control = formGroup.get(field);
        if (control) {
          const errors = Array.isArray(messages)
            ? messages.map((msg) => ({ serverError: msg }))
            : [{ serverError: messages }];
          errors.forEach((error) => control.setErrors(error));
        }
      });
    }
  } else {
    console.error('Unexpected Error:', error?.message || error);
  }
};
