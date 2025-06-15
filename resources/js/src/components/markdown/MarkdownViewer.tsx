import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

type MarkdownViewerProps = {
  content: string;
  onLinkClick?: (href: string) => void;
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, onLinkClick }) => {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Copy
                </button>
                <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          a({ href, children, ...props }) {
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              if (onLinkClick && href?.startsWith('#')) {
                e.preventDefault();
                onLinkClick(href);
              }
            };

            return (
              <a
                href={href}
                onClick={handleClick}
                className="text-blue-600 hover:underline font-medium"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
