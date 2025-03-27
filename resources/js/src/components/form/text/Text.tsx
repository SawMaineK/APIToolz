import { FormText } from '../base/form-text';

interface TextProps extends FormText {}

export const Text = ({ altClass, style, label }: TextProps) => {
  return (
    <div className={`mb-4 ${altClass}`} style={style}>
      <p dangerouslySetInnerHTML={{ __html: label }} style={style}></p>
    </div>
  );
};
