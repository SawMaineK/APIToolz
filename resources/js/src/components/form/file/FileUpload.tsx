import React, { useEffect, useRef, useState, DragEvent } from 'react';
import { BaseForm } from '../base/base-form';
import { File, FileCode, FileSpreadsheet, FileText } from 'lucide-react';

interface PreviewFile {
  file: File;
  url: string;
}

export const FileUpload: React.FC<BaseForm<string>> = ({ formGroup, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);

  const MAX_FILE_SIZE_KB = 1024 * 10; // 10 MB

  // Initialize preview from formGroup
  useEffect(() => {
    const files: any[] | any = formGroup?.controls?.[props.name]?.value;
    if (files) {
      const initialPreview: PreviewFile[] = [];
      const processFile = (file: any) => {
        if (file?.url?.startsWith('http')) {
          initialPreview.push({ file, url: file.url });
        } else {
          initialPreview.push({
            file,
            url: isImage(file)
              ? `${window.location.origin}/img/${file?.url}`
              : `${window.location.origin}/file/${file?.url}`
          });
        }
      };

      if (Array.isArray(files)) files.forEach(processFile);
      else processFile(files);

      setPreviewFiles(initialPreview);
    }
  }, [formGroup, props.name]);

  // Reset handler
  useEffect(() => {
    if (formGroup && typeof formGroup.reset === 'function') {
      const originalReset = formGroup.reset;
      formGroup.reset = (...args: any[]) => {
        originalReset.apply(formGroup, args);
        setPreviewFiles([]);
        if (inputRef.current) inputRef.current.value = '';
        formGroup.controls?.[props.name]?.setValue(props.multipleFile ? [] : '');
      };
      return () => {
        formGroup.reset = originalReset;
      };
    }
  }, [formGroup, props.multipleFile, props.name]);

  // Detect if file is image
  const isImage = (file: File) => file != null && file?.type?.startsWith('image/');

  // Validate files
  const handleFiles = (selectedFiles: File[]) => {
    const validFiles: PreviewFile[] = [];

    selectedFiles.forEach((file) => {
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > MAX_FILE_SIZE_KB) {
        alert(`File "${file.name}" exceeds the max size of 10 MB.`);
        return;
      }

      if (
        props.acceptFiles.length > 0 &&
        !props.acceptFiles.some((ext: string) =>
          file.name.toLowerCase().endsWith(ext.toLowerCase())
        )
      ) {
        alert(
          `File "${file.name}" is not an allowed type. Only accepted for ${props.acceptFiles.join(', ')}`
        );
        return;
      }

      validFiles.push({ file, url: URL.createObjectURL(file) });
    });

    setPreviewFiles(validFiles);

    if (props.multipleFile) {
      formGroup?.controls?.[props.name]?.setValue(validFiles.map((f) => f.file));
    } else {
      formGroup?.controls?.[props.name]?.setValue(validFiles[0]?.file || '');
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(Array.from(e.target.files));
  };

  const removeFileAt = (index: number) => {
    const updated = [...previewFiles];
    updated.splice(index, 1);
    setPreviewFiles(updated);

    const currentFiles = formGroup?.controls?.[props.name]?.value;
    if (Array.isArray(currentFiles)) {
      currentFiles.splice(index, 1);
      formGroup?.controls?.[props.name]?.setValue(currentFiles.length > 0 ? currentFiles : []);
    } else {
      formGroup?.controls?.[props.name]?.setValue('');
    }
  };

  const clickInput = () => {
    if (!props.readonly) {
      inputRef.current?.click();
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!props.readonly) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    }
  };

  const getFileIcon = (file: File) => {
    const ext = file?.name?.split('.').pop()?.toLowerCase();

    const baseClasses = 'w-full h-full flex items-center justify-center rounded-lg font-bold text-xl';

    switch (ext) {
      case 'pdf':
        return (
          <div className={`${baseClasses} bg-red-100 text-red-600`}>
            <FileText className="w-10 h-10 mr-2" />
            PDF
          </div>
        );
      case 'doc':
      case 'docx':
        return (
          <div className={`${baseClasses} bg-blue-100 text-blue-600`}>
            <FileText className="w-10 h-10 mr-2" />
            DOC
          </div>
        );
      case 'xls':
      case 'xlsx':
        return (
          <div className={`${baseClasses} bg-green-100 text-green-600`}>
            <FileSpreadsheet className="w-10 h-10 mr-2" />
            XLS
          </div>
        );
      case 'ppt':
      case 'pptx':
        return (
          <div className={`${baseClasses} bg-orange-100 text-orange-600`}>
            <File className="w-10 h-10 mr-2" />
            PPT
          </div>
        );
      case 'js':
      case 'ts':
      case 'json':
        return (
          <div className={`${baseClasses} bg-yellow-100 text-yellow-600`}>
            <FileCode className="w-10 h-10 mr-2" />
            CODE
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-200 text-gray-600`}>
            <File className="w-10 h-10 mr-2" />
            {ext?.toUpperCase() || 'FILE'}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700">
          {props.label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Drag-and-drop area for multiple */}
      {props.multipleFile && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
          onClick={clickInput}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {previewFiles.length === 0 ? (
            <p className="text-gray-400">
              Drag & drop files here, or click to upload <br />
              {props.acceptFiles && props.acceptFiles.length > 0 && (
                <>
                  {' '}
                  (Accepted files: {props.acceptFiles.map((ext) => ext.replace('.', '')).join(', ')}
                  )
                </>
              )}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {previewFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="relative border rounded-lg flex flex-col items-center overflow-hidden"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.file?.name}
                    className="block w-full"
                  >
                    <div className="w-full h-32 flex items-center justify-center overflow-hidden bg-gray-50">
                      {isImage(file.file) ? (
                        <img
                          src={file.url}
                          alt={file.file.name}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        getFileIcon(file.file)
                      )}
                    </div>
                  </a>

                  {/* File name + size below preview */}
                  <div className="w-full text-center p-1 bg-white">
                    <p className="text-xs text-gray-700 truncate" title={file.file.name}>
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">{(file.file.size / 1024).toFixed(2)} KB</p>
                  </div>

                  {!props.readonly && (
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-6 h-6 text-red-600 rounded-full bg-white shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFileAt(idx);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Single file preview */}
      {!props.multipleFile && props.filePreview && previewFiles[0] && (
        <div className="relative w-[180px] border rounded-lg flex flex-col overflow-hidden">
          <a
            href={previewFiles[0].url}
            target="_blank"
            rel="noopener noreferrer"
            download={previewFiles[0].file?.name}
            className="block w-full"
          >
            <div className="w-full h-32 flex items-center justify-center overflow-hidden bg-gray-50">
              {isImage(previewFiles[0].file) ? (
                <img
                  src={previewFiles[0].url}
                  alt={previewFiles[0].file.name}
                  className="object-contain w-full h-full"
                />
              ) : (
                getFileIcon(previewFiles[0].file)
              )}
            </div>
          </a>

          {/* File name + size below preview */}
          <div className="w-full text-center p-1 bg-white">
            <p className="text-xs text-gray-700 truncate" title={previewFiles[0].file.name}>
              {previewFiles[0].file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(previewFiles[0].file.size / 1024).toFixed(2)} KB
            </p>
          </div>

          {!props.readonly && (
            <button
              type="button"
              className="absolute top-1 right-1 w-6 h-6 text-red-600 rounded-full bg-white shadow"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeFileAt(0);
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        className={!props.multipleFile ? 'file-input' : 'hidden'}
        multiple={props.multipleFile}
        onChange={onChange}
        accept={Array.isArray(props.acceptFiles) ? props.acceptFiles.join(',') : undefined}
      />

      {props.hint && <p className="text-sm text-gray-500">{props.hint}</p>}
    </div>
  );
};
