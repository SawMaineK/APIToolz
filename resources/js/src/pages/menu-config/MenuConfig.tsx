import React, { useEffect, useState } from 'react';
import { FormLayout } from '@/components/form/FormLayout';
import { FormSubmit } from '@/components/form/base/form-submit';
import { FormCoder } from '@/components/form/base/form-coder';
import { BaseForm } from '@/components/form/base/base-form';
import { FormGroup } from 'react-reactive-form';
import { Subject } from 'rxjs';
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useSettings } from '@/providers';
import axios from 'axios';
import { toast } from 'sonner';

interface MenuConfigProps {
  menu: any[];
}

const MenuConfig = ({ menu }: MenuConfigProps) => {
  const { settings, updateSettings } = useSettings();
  const initialValues = {
    menu_config: `${JSON.stringify(menu)}`
  };

  const formLayout: BaseForm<string>[] = [
    new FormCoder({
      name: 'menu_config',
      config: {
        height: '400px',
        defaultLanguage: 'json'
      }
    }),
    new FormSubmit({
      label: `Submit Changes`,
      display: 'flex flex-col gap-1',
      altClass: 'flex',
      inputClass: `flex justify-center`
    })
  ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/appsetting/${settings.configId}`,
        {
          key: settings.configKey,
          menu_config: JSON.parse(value.menu_config)
        }
      );
      updateSettings({ menuConfig: data.menu_config });
      toast.success('Changes have been successfully applied.');
      submitted$.next(true);
    } catch (error: any) {
      console.error('Form submission failed:', error);
      // Set error state in the form
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        formGroup.setErrors({ submit: data.message });
        if (data.errors && status === 400) {
          Object.entries(data.errors).forEach(([field, message]) => {
            if (formGroup.get(field)) {
              if (message instanceof Array) {
                message.forEach((msg: any) => {
                  formGroup.get(field)?.setErrors({ serverError: msg });
                });
              } else {
                formGroup.get(field)?.setErrors({ serverError: message });
              }
            }
          });
        }
      } else {
        console.error('Unexpected Error:', error?.message || error);
      }
    } finally {
      submitted$.next(true);
    }
  };

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text={`Menu Settings`} />
          <ToolbarDescription>
            Edit the structure of your sidebar menu, including nesting and order.
            <a
              href="https://lucide.dev/icons/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              <i className="ki ki-bold-link"></i> See icons
            </a>
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>
      <div>
        <FormLayout
          initValues={initialValues}
          formLayout={formLayout}
          onSubmitForm={formSubmit}
        ></FormLayout>
      </div>
    </div>
  );
};

export default MenuConfig;
