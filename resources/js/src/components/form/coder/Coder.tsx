import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FormTextArea } from '../base/form-textarea';

interface CoderProps extends FormTextArea {
  handler: any;
  formGroup: any;
}

export const Coder = ({ handler, formGroup, ...props }: CoderProps) => {
  const editorRef = useRef<any>(null);

  const defaultConfig = {
    width: '100%',
    height: '300px',
    fontFamily: 'Poppins',
    defaultLanguage: props.config?.defaultLanguage || 'javascript',
    className: props.inputClass,
    ...props.config
  };

  const onChange = (content: any) => {
    formGroup.controls[props.name].setValue(content, { onlySelf: false, emitEvent: false });
  };

  const getValue = () => {
    return formGroup.controls[props.name].value || '';
  };

  return (
    <div className={`mb-4 ${props.altClass}`} style={props.style}>
      {props.label && (
        <label className="block text-sm font-medium text-gray-700">
          {props.label}
          {props.required && <b className="text-red-500">*</b>}
          {props.tooltip && (
            <span className="ml-2 text-gray-400">
              <i className="las la-question-circle text-xl"></i>
            </span>
          )}
        </label>
      )}

      <div className="mt-2">
        <Editor
          {...defaultConfig}
          onMount={(editor: any, monaco: any) => {
            editorRef.current = editor;
            monaco.editor.defineTheme('my-theme', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#1b1b29',
                'editor.color': '#ffffff'
              }
            });
            monaco.editor.setTheme('my-theme');
          }}
          value={getValue() || ''}
          onChange={onChange}
        />
      </div>

      {props.hint && (
        <div
          className="mt-2 text-sm text-gray-500"
          dangerouslySetInnerHTML={{ __html: props.hint }}
        ></div>
      )}
    </div>
  );
};
