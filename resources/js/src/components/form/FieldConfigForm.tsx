import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { floatingInput, floatingSelect } from './FormFieldPropertiesPanel';
import { BaseForm } from './base/base-form';

interface FieldConfigProps {
  form: BaseForm<string>;
  onChange: (updated: any) => void;
}

export const FieldConfigForm = ({ form, onChange }: FieldConfigProps) => {
  function setIn(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const newObj = { ...obj };

    let curr = newObj;
    for (const key of keys) {
      if (typeof curr[key] !== 'object' || curr[key] === null) {
        curr[key] = {};
      } else {
        curr[key] = { ...curr[key] }; // clone intermediate objects
      }
      curr = curr[key];
    }

    curr[lastKey] = value;
    return newObj;
  }

  const update = (key: string, value: any) => {
    const updatedForm = key.includes('.') ? setIn(form, key, value) : { ...form, [key]: value };
    onChange(updatedForm);
  };

  const updateOption = (index: number, field: 'label' | 'value', val: string) => {
    const newOptions = [...(form.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: val };
    update('options', newOptions);
  };

  const addOption = () => {
    update('options', [...(form.options || []), { label: '', value: '' }]);
  };

  const removeOption = (index: number) => {
    const newOptions = [...(form.options || [])];
    newOptions.splice(index, 1);
    update('options', newOptions);
  };

  return (
    <div className="space-y-5">
      {floatingSelect(
        'controlType',
        form.controlType,
        'Control Type',
        [
          'textbox',
          'password',
          'textarea',
          'label',
          'checkbox',
          'coder',
          'component',
          'date',
          'datetime',
          'dummy',
          'editor',
          'file',
          'hidden',
          'img',
          'mask',
          'note',
          'radio',
          'reset',
          'dropdown',
          'separator',
          'linebreak',
          'sub_title',
          'submit',
          'switch',
          'text',
          'title'
        ],
        (val: any) => update('controlType', val)
      )}
      {/* Only show Name field if controlType needs a name */}
      {[
        'textbox',
        'password',
        'textarea',
        'checkbox',
        'coder',
        'component',
        'date',
        'datetime',
        'editor',
        'file',
        'img',
        'mask',
        'note',
        'radio',
        'dropdown',
        'switch',
        'text',
        'hidden'
      ].includes(form.controlType) &&
        floatingInput('name', form.name, 'Name(eg., category_id)', (e) =>
          update('name', e.target.value)
        )}
      {floatingInput('label', form.label, 'Label', (e) => update('label', e.target.value))}
      {form.controlType === 'dropdown' && (
        <>
          {floatingSelect(
            'config.opt_type',
            form.config?.opt_type || '',
            'Option Type',
            ['static', 'async'],
            (val: any) => update('config.opt_type', val)
          )}

          {form.config.opt_type === 'static' && (
            <div className="space-y-3">
              <div className="font-medium">Options</div>
              {(form.options || []).map((opt, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label"
                    value={opt.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={opt.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:underline"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="text-blue-500 hover:underline" onClick={addOption}>
                + Add Option
              </button>
            </div>
          )}

          {form.config.opt_type === 'async' && (
            <div className="space-y-3">
              {floatingInput(
                'config.lookup_model',
                form.config.lookup_model || '',
                'Lookup Model',
                (e) => update('config.lookup_model', e.target.value)
              )}
              {floatingInput('config.lookup_key', form.config.lookup_key || '', 'Lookup Key', (e) =>
                update('config.lookup_key', e.target.value)
              )}
              {floatingInput(
                'config.lookup_value',
                form.config.lookup_value || '',
                'Lookup Value',
                (e) => update('config.lookup_value', e.target.value)
              )}
              {floatingInput(
                'config.lookup_dependency_key',
                form.config.lookup_dependency_key || '',
                'Lookup Dependency Key',
                (e) => update('config.lookup_dependency_key', e.target.value)
              )}
            </div>
          )}
        </>
      )}

      {floatingInput('value', form.value || '', 'Default Value', (e) =>
        update('value', e.target.value)
      )}

      {floatingInput('valueFn', form.valueFn || '', 'Function Value', (e) =>
        update('valueFn', e.target.value)
      )}

      {floatingInput('columns', form.columns || '', 'Columns (e.g., w-full)', (e) =>
        update('columns', e.target.value)
      )}

      {[
        'textbox',
        'textarea',
        'checkbox',
        'coder',
        'component',
        'date',
        'datetime',
        'editor',
        'file',
        'img',
        'mask',
        'note',
        'radio',
        'dropdown',
        'switch',
        'text',
        'hidden'
      ].includes(form.controlType) && (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={form.required || false}
            onCheckedChange={(val) => update('required', val)}
          />
          <span>Required</span>
        </div>
      )}
    </div>
  );
};
