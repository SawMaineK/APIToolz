import { useEffect, useRef, useState } from 'react';
import { FormInput } from '../base/form-input';

export const FileUpload = ({ handler, formGroup, ...props }: FormInput) => {
  const [files, setFiles] = useState<any>(null);
  const [previewFiles, setPreviewFiles] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fileUrls: any[] = [];
    const files: any[] | any = formGroup.controls?.[props.name]?.value;
    if (files) {
      const processFile = (file: any) => {
        if (file?.url?.startsWith('http')) {
          fileUrls.push({ url: file?.url, file });
        } else {
          fileUrls.push({
            url: `${window.location.origin}/img/${file?.url}`,
            file
          });
        }
      };

      if (Array.isArray(files)) {
        files.forEach(processFile);
      } else {
        processFile(files);
      }
      setPreviewFiles(fileUrls);
    }
  }, []);

  useEffect(() => {
    if (formGroup && typeof formGroup.reset === 'function') {
      const originalReset = formGroup.reset;
      formGroup.reset = (...args: any[]) => {
        originalReset.apply(formGroup, args);
        if (inputRef.current) inputRef.current.value = '';
        setPreviewFiles([]);
        if (formGroup.controls?.[props.name]) {
          formGroup.controls[props.name].setValue('');
        }
      };
      return () => {
        formGroup.reset = originalReset;
      };
    }
  }, [formGroup]);

  const onChange = (e: any) => {
    const selectedFiles = Array.from(e.target.files);
    const fileUrls: any[] = [];

    selectedFiles.forEach((file: any) => {
      if (file.size / 1024 > 4048) {
        alert('The file size must be less than 2 MB.');
        return;
      }
      fileUrls.push({ url: URL.createObjectURL(file), file });
    });

    setPreviewFiles(fileUrls);

    if (props.multiple) {
      formGroup.controls?.[props.name]?.setValue(selectedFiles);
    } else {
      formGroup.controls?.[props.name]?.setValue(selectedFiles[0]);
    }
  };

  const removeFiles = () => {
    setPreviewFiles([]);
    formGroup.controls?.[props.name]?.setValue('');
  };

  const removeAtFile = (e: any, index: number) => {
    e.preventDefault();
    const updatedPreviewFiles = [...previewFiles];
    updatedPreviewFiles.splice(index, 1);
    setPreviewFiles(updatedPreviewFiles);

    const formFiles = formGroup.controls?.[props.name]?.value;
    if (Array.isArray(formFiles)) {
      formFiles.splice(index, 1);
      formGroup.controls?.[props.name]?.setValue(formFiles.length > 0 ? formFiles : '');
    }
  };

  const clickFile = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-1">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700">
          {props.label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      {props.filePreview && !props.multiple && (
        <div className="relative w-32 h-32 border rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
          {previewFiles.length > 0 ? (
            <img src={previewFiles[0].url} alt="Preview" className="object-cover w-full h-full" />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onChange}
            accept={props.acceptFiles}
          />
          <button
            type="button"
            className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 shadow"
            onClick={removeFiles}
          >
            ✕
          </button>
        </div>
      )}
      {props.filePreview && props.multiple && (
        <div className="space-y-2">
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={clickFile}
          >
            Upload Files
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onChange}
            accept={props.acceptFiles}
          />
          <div className="grid grid-cols-3 gap-4">
            {previewFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={file.url}
                  alt={file.file.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 shadow"
                  onClick={(e) => removeAtFile(e, index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {!props.filePreview && (
        <div>
          <input
            ref={inputRef}
            type="file"
            className="file-input"
            onChange={onChange}
            multiple={props.multiple}
            accept={props.acceptFiles}
          />
        </div>
      )}
      {props.hint && <p className="mt-2 text-sm text-gray-500">{props.hint}</p>}
    </div>
  );
};
