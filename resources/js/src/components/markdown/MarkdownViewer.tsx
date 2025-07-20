import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

type MarkdownViewerProps = {
  content: string;
  onLinkClick?: (href: string) => void;
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, onLinkClick }) => {
  return (
    <div className="prose prose-slate prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold border-b pb-1 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold border-b pb-1 mt-8 mb-3">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="text-md font-medium mt-6 pb-1 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-medium mt-4 mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-base font-semibold mt-4 mb-2">{children}</h5>,
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold uppercase tracking-wider mt-3 mb-2">{children}</h6>
          ),
          code({
            inline,
            className,
            children,
            ...props
          }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) {
            const match = /language-(\w+)/.exec(className || '');
            const handleCopy = () => {
              if (children) {
                navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                toast.success('Code copied to clipboard');
              }
            };

            return !inline && match ? (
              <div className="relative my-4 rounded-md overflow-hidden">
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded hover:bg-gray-700 z-10"
                >
                  Copy
                </button>
                <SyntaxHighlighter
                  language={match[1]}
                  style={vscDarkPlus}
                  customStyle={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    overflowX: 'auto',
                    fontSize: '0.875rem'
                  }}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props}>
                {children}
              </code>
            );
          },

          a({ href, children, ...props }) {
            const isInternal = href?.startsWith('#');
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (onLinkClick && isInternal) {
                e.preventDefault();
                onLinkClick(href ?? '');
              }
            };

            return (
              <a
                href={href}
                onClick={handleClick}
                target={isInternal ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
                {...props}
              >
                {children}
              </a>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border px-4 py-2 bg-gray-100 text-left font-semibold">{children}</th>
            );
          },

          td({ children }) {
            return <td className="border px-4 py-2">{children}</td>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
