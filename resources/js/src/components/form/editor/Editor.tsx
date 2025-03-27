import { Editor as TinyEditor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import { FormTextArea } from '../base/form-textarea';
import { Editor as TinyMCE } from 'tinymce';

export const Editor = ({ handler, formGroup, ...props }: FormTextArea) => {
  const editorRef = useRef<TinyMCE | null>(null);

  const defaultConfig = {
    height: '300px',
    width: '100%',
    menubar: false,
    resize: 'both',
    placeholder: props.placeholder || 'Type here...',
    mobile: {
      theme: 'mobile'
    },
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code hint wordcount'
    ],
    toolbar:
      'undo redo | formatselect | ' +
      'bold italic backcolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | table | fullscreen | hint',
    content_style: 'body { background-color: #fff !important }'
  };

  const onChange = () => {
    if (editorRef.current) {
      formGroup.controls[props.name].setValue(editorRef.current.getContent(), {
        onlySelf: false,
        emitEvent: false
      });
    }
  };

  const getValue = () => {
    return formGroup.controls[props.name].value || '';
  };
  const unqKey = (Math.random() + 1).toString(36).substring(7);
  return (
    <div className="w-full">
      <div
        className={`${props.display == 'x' ? 'flex items-baseline flex-wrap lg:flex-nowrap gap-2.5' : props.display} ${props.altClass}`}
        style={props.style}
      >
        {props.label && (
          <label className="form-label max-w-32">
            {props.label}
            {props.required && <span className="text-danger">*</span>}
          </label>
        )}
        <div className="flex flex-col w-full gap-1">
          {props.component ? (
            <>{props.component(handler, formGroup, props)}</>
          ) : (
            <TinyEditor
              apiKey={`q6ii6g1us71ghv6mswnn3cexebrbbx2naq4fkzd0tv6t78px`}
              onInit={(evt, editor) => (editorRef.current = editor)}
              initialValue={getValue() || ''}
              onChange={onChange}
              init={{ ...defaultConfig, ...props.config }}
            />
          )}
          {props.hint && (
            <div className="form-hint" dangerouslySetInnerHTML={{ __html: props.hint }}></div>
          )}
          {props.tooltip ? (
            <div className="tooltip" id={`${props.name}-${unqKey}-tooltip`}>
              {props.tooltip}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
