import { toast } from 'sonner';
import axios from 'axios';
import { ModelContentProps } from '../_models';
import { FormLayout } from '@/components/form/FormLayout';
import { Link, useNavigate } from 'react-router-dom';
import { BaseForm } from '@/components/form/base/base-form';
import { FormGroup } from 'react-reactive-form';
import { FormSubmit } from '@/components/form/base/form-submit';
import { Subject } from 'rxjs';
import { generateFormLayout, objectToFormData, toFormLayout } from '../_helper';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { KeenIcon } from '@/components/keenicons';
import { Cpu } from 'lucide-react';
import { DropdownChatAI } from '@/partials/dropdowns/chat-ai';
import { useLanguage } from '@/i18n';
import { useRef } from 'react';

const Create = ({ model, modelData, isModal, onCreated }: ModelContentProps) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const itemAIChatRef = useRef<any>(null);

  const handleShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  const initialValues = {
    ...modelData
  };

  const formLayout: BaseForm<string>[] = model.config.formLayout
    ? toFormLayout(model.config.formLayout, model.config.forms)
    : [
        ...generateFormLayout(model.config.forms || [], isModal || false),
        new FormSubmit({
          label: `Submit`,
          display: 'flex flex-col gap-1',
          altClass: 'flex',
          inputClass: `flex justify-center ${isModal ? 'grow' : ''}`
        })
      ];

  const formSubmit = async (value: any, formGroup: FormGroup, submitted$: Subject<boolean>) => {
    try {
      const formData = objectToFormData(value);

      if (modelData) {
        formData.append('_method', 'PUT');
      }

      const url =
        `${import.meta.env.VITE_APP_API_URL}/${model.slug}` + (modelData ? `/${modelData.id}` : '');
      const result = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: '' // Add token here if needed
        }
      });

      toast.success(`Successfully ${modelData ? 'updated' : 'created'}`);
      submitted$.next(true);

      if (isModal) {
        formGroup.reset();
        onCreated?.(result.data);
      } else {
        navigate(`/apitoolz/model/${model.slug}`, { replace: true });
      }
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
    <>
      {isModal ? (
        <div className="">
          <FormLayout
            initValues={initialValues}
            formLayout={formLayout}
            onSubmitForm={formSubmit}
          ></FormLayout>
        </div>
      ) : (
        <div className="card w-full">
          <div className="card-body flex flex-col gap-5">
            <Toolbar>
              <ToolbarHeading>
                <ToolbarPageTitle
                  text={modelData ? `Edit ${model?.title || ''}` : `New  ${model?.title || ''}`}
                />
              </ToolbarHeading>
              <ToolbarActions>
                <Link to={`/apitoolz/model/${model.slug}/builder`} className="btn btn-sm btn-light">
                  <KeenIcon icon="setting-2" className="!text-base" />
                  Builder
                </Link>
                <Menu>
                  <MenuItem
                    ref={itemAIChatRef}
                    onShow={handleShow}
                    toggle="dropdown"
                    trigger="click"
                    dropdownProps={{
                      placement: isRTL() ? 'bottom-start' : 'bottom-end',
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: isRTL() ? [-170, 10] : [50, -100]
                          }
                        }
                      ]
                    }}
                  >
                    <MenuToggle className="btn btn-sm btn-primary">
                      <Cpu size={16} />
                      AI Assist
                    </MenuToggle>

                    {DropdownChatAI({ menuTtemRef: itemAIChatRef, model: model, type: 'request' })}
                  </MenuItem>
                </Menu>
              </ToolbarActions>
            </Toolbar>
            <FormLayout
              initValues={initialValues}
              formLayout={formLayout}
              onSubmitForm={formSubmit}
            ></FormLayout>
          </div>
        </div>
      )}
    </>
  );
};

export { Create };
