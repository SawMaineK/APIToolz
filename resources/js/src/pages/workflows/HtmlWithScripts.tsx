import { useEffect, useRef } from 'react';

interface HtmlWithScriptsProps {
  renderedView: string;
}

export default function HtmlWithScripts({ renderedView }: HtmlWithScriptsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const scripts = containerRef.current.querySelectorAll<HTMLScriptElement>('script');

      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');

        // copy attributes (src, type, etc.)
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // copy inline script code if present
        if (oldScript.textContent) {
          newScript.appendChild(document.createTextNode(oldScript.textContent));
        }

        // replace old script so the browser executes it
        if (oldScript.parentNode) {
          oldScript.parentNode.replaceChild(newScript, oldScript);
        }
      });
    }
  }, [renderedView]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: renderedView }} />;
}
