/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { getHeight, toAbsoluteUrl } from '@/utils';
import { KeenIcon } from '@/components';
import { useViewport } from '@/hooks';
import { useAuthContext } from '@/auth';
import axios from 'axios';
import { IDropdownChatProps } from '@/partials/dropdowns/chat/types';
import { DropdownChatMessageOut } from '@/partials/dropdowns/chat/DropdownChatMessageOut';
import { DropdownChatMessageIn } from '@/partials/dropdowns/chat/DropdownChatMessageIn';
import { IDropdownMessage } from '@/partials/dropdowns/chat-ai/types';

const GeneralAIAssist = ({ menuTtemRef, slug, type }: IDropdownChatProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [scrollableHeight, setScrollableHeight] = useState<number>(0);
  const [viewportHeight] = useViewport();
  const { currentUser } = useAuthContext();
  const offset = 110;
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = now.getHours();
  const minutes = pad(now.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const currentTime = `${pad(hour12)}:${minutes} ${ampm}`;

  const [messages, setMessages] = useState<IDropdownMessage[]>([]);
  const [askInput, setAskInput] = useState('');

  const promptTable = () => `
Get started with a prompt:

[> How do I configure a relationship for ${slug} model?](#how-do-i-configure-a-relationship) \n
[> How do I configure a table column position for ${slug} model?](#how-do-i-configure-table-column-position) \n
[> How do I configure a column show-hide for ${slug} model?](#how-do-i-configure-column-show-hide) \n
[> How do I configure a table filter for ${slug} model?](#how-do-i-configure-table-filter) \n
[> How do I configure a kpi summary report for ${slug} model?](#how-do-i-configure-a-summary) \n
`;

  const promptForm = () => `
Get started with a prompt:

[> How do I configure a form input for ${slug} model?](#how-do-i-configure-a-form-input) \n
[> How do I configure a form validator for ${slug} model?](#how-do-i-configure-a-form-validator) \n
[> How do I configure a form input type (e.g., select, checkbox) for ${slug} model?](#how-do-i-configure-a-form-select)
`;

  const promptSummary = () => `
Get started with a prompt:

[> How do I configure a summary report for ${slug} model?](#how-do-i-configure-a-summary) \n
`;

  const promptDashboard = () => `
Get started with a prompt:

[> How do I configure a summary report for ${slug}?](#how-do-i-configure-a-dashboard) \n
`;

  const hints = [
    {
      link: 'how-do-i-configure-a-relationship',
      hint: `
\`\`\`shell
    php artisan apitoolz:relation Customer \\
    --title=orders \\
    --relation-model=Order \\
    --relation-type=hasMany \\
    --display-field=order_number'
\`\`\`
`
    },
    {
      link: 'how-do-i-configure-table-column-position',
      hint: `
\`\`\`shell
    php artisan apitoolz:response Product \\
    --field=name \\
    --label="Product Name" \\
    --position=1
\`\`\``
    },
    {
      link: 'how-do-i-configure-column-show-hide',
      hint: `
\`\`\`shell
    php artisan apitoolz:response Product \\
    --field=internal_notes \\
    --visible=false
\`\`\``
    },
    {
      link: 'how-do-i-configure-table-filter',
      hint: `
1 - To define a filter with a specific type:\n
\`\`\`shell
    php artisan apitoolz:filter Product \\
    --title=category \\
    --filter-type=select \\
    --filter-model=Category \\
    --filter-key=category_id \\
    --filter-label=name
\`\`\` \n

2 - To define a filter with a custom query:\n
\`\`\`shell
    php artisan apitoolz:filter Order \\
    --title=status \\
    --filter-type=select \\
    --filter-query='pending:Pending|completed:Completed|canceled:Canceled' \\
    --filter-key=status
\`\`\``
    },
    {
      link: 'how-do-i-configure-a-summary',
      hint: `
1. To create a simple count summary for a model:
    \`\`\`shell
    php artisan apitoolz:summary Product --title="Total Products" --type=kpi --icon=box --method=count
    \`\`\`

2. To create a sum summary for a specific column:
    \`\`\`shell
    php artisan apitoolz:summary Sale --title="Total Sales Amount" --type=kpi --icon=dollar-sign --method=sum --column=amount
    \`\`\`

3. To create a grouped bar chart summary:
    \`\`\`shell
    php artisan apitoolz:summary Order --title="Orders by Status" --type=chart --chart-type=bar --group-by=status --aggregate=count

\`\`\``
    },
    {
      link: 'how-do-i-configure-a-dashboard',
      hint: `
1. To create a simple count summary for a dashboard:
    \`\`\`shell
    php artisan apitoolz:summary Dashboard --model=Product --title="Total Products" --type=kpi --icon=box --method=count
    \`\`\`

2. To create a sum summary for a specific column:
    \`\`\`shell
    php artisan apitoolz:summary Dashboard --model=Sale --title="Total Sales Amount" --type=kpi --icon=dollar-sign --method=sum --column=amount
    \`\`\`

3. To create a grouped bar chart summary:
    \`\`\`shell
    php artisan apitoolz:summary Dashboard --model=Order --title="Orders by Status" --type=chart --chart-type=bar --group-by=status --aggregate=count

\`\`\``
    }
  ];

  const extractPromptValue = (str: string, key: string) => {
    const regex = new RegExp(`\\[> ([^\\]]+)\\]\\(#${key}\\)`, 'im');
    const match = str.match(regex);
    return match ? match[1] : null;
  };

  const defaultMessages = [
    {
      text: `# Hello, ${currentUser?.name || 'User'}, How can I help you?`,
      time: currentTime,
      in: true
    },
    {
      text: (() => {
        switch (type) {
          case 'promptTable':
            return promptForm();
          case 'request':
            return promptForm();
          case 'summary':
            return promptSummary();
          case 'dashboard':
            return promptDashboard();
          default:
            return `Get prompt by type #`;
        }
      })(),
      time: currentTime,
      in: true
    }
  ];

  useEffect(() => {
    fetchModelChatHistory(slug, '', type, '');
    if (messagesRef.current) {
      let availableHeigh: number = viewportHeight - offset;

      if (headerRef.current) availableHeigh -= getHeight(headerRef.current);
      if (footerRef.current) availableHeigh -= getHeight(footerRef.current);

      setScrollableHeight(availableHeigh);
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesRef.current) {
      setTimeout(() => {
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 0);
    }
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const link = href.replace('#', '');
      let question: string = '';
      switch (type) {
        case 'request':
          question = extractPromptValue(promptForm(), link) || '';
          break;
        case 'summary':
          question = extractPromptValue(promptSummary(), link) || '';
          break;
        case 'dashboard':
          question = extractPromptValue(promptDashboard(), link) || '';
          break;
        default:
          question = extractPromptValue(promptTable(), link) || '';
          break;
      }
      if (!question) return null;
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: question,
          out: true,
          time: currentTime
        }
      ]);
      scrollToBottom();
      const hint = hints.find((h) => h.link == link)?.hint;
      fetchModelChatHistory(slug, question, type, hint || '');
      return false;
    } else {
      window.open(href, '_blank');
    }
  };

  const handleFormSubmit = (ask: string) => {
    if (!ask) return;
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: ask,
        out: true,
        time: currentTime
      }
    ]);
    scrollToBottom();
    fetchModelChatHistory(slug, ask, type, '');
  };
  const lastone = true;
  const fetchModelChatHistory = async (
    slug: string | undefined,
    question: string,
    type: string,
    hint: string
  ) => {
    if (!slug) return;
    try {
      const { data } = await axios.post<any>(
        `${import.meta.env.VITE_APP_API_URL}/model/${slug}/ask`,
        { question, type, hint, lastone }
      );
      // If data is an array, map over it; otherwise, handle as a single message
      setMessages(() => {
        if (Array.isArray(data)) {
          return [
            ...defaultMessages,
            ...data.slice(-5).flatMap((item: any) => [
              {
                text: item.ask,
                out: true,
                time: currentTime
              },
              {
                text: item.content,
                in: true,
                time: currentTime
              }
            ])
          ];
        } else {
          const newMessages = [
            {
              text: data.ask,
              out: true,
              time: currentTime
            },
            {
              text: data.content,
              in: true,
              time: currentTime
            }
          ];
          return [...defaultMessages, ...newMessages];
        }
      });
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching model:', error);
    }
  };

  const buildMessages = (messages: IDropdownMessage[]) => {
    return (
      <div className="flex flex-col gap-5 py-5 chat-messages">
        {messages.map((message, index) => {
          if (message.out) {
            return (
              <DropdownChatMessageOut
                key={index}
                text={message.text}
                time={message.time}
                read={message.read || false}
                avatar={
                  currentUser?.avatar
                    ? `${import.meta.env.VITE_APP_IMAGE_URL}/${currentUser?.avatar}`
                    : toAbsoluteUrl('/media/avatars/blank.png')
                }
              />
            );
          } else if (message.in) {
            return (
              <DropdownChatMessageIn
                key={index}
                text={message.text}
                time={message.time}
                onLinkClick={handleLinkClick}
              />
            );
          }
          return null; // Handle cases where neither `in` nor `out` is specified
        })}
      </div>
    );
  };

  const buildLoader = () => {
    return (
      <div className="flex items-center gap-2 px-5 py-2">
        <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
        <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
        <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
        <span className="text-xs text-gray-500 ms-2">AI is typing…</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[100%] light:border-gray-300">
      <div
        ref={messagesRef}
        className="scrollable-y-auto"
        style={{ maxHeight: `${scrollableHeight}px`, minHeight: '500px' }}
      >
        {buildMessages(messages)}
        {/* Typing/loading indicator */}
        {messages.length > 0 && messages[messages.length - 1].out && buildLoader()}
      </div>

      <div className="relative grow mx-5 mb-2.5">
        <img
          src={
            currentUser?.avatar
              ? `${import.meta.env.VITE_APP_IMAGE_URL}/${currentUser?.avatar}`
              : toAbsoluteUrl('/media/avatars/blank.png')
          }
          className="rounded-full size-[30px] absolute start-0 top-2/4 -translate-y-2/4 ms-2.5"
          alt=""
        />

        <textarea
          className="input h-auto py-4 pb-2 ps-12 bg-transparent"
          value={askInput}
          onChange={(e) => setAskInput(e.target.value)}
          placeholder="Ask you question here..."
        />

        <div className="flex items-center gap-2.5 absolute end-3 top-1/2 -translate-y-1/2">
          <button className="btn btn-sm btn-icon btn-light btn-clear">
            <KeenIcon icon="exit-up" />
          </button>
          <button
            className="btn btn-dark btn-sm"
            disabled={!askInput}
            onClick={() => {
              handleFormSubmit(askInput);
              setAskInput('');
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export { GeneralAIAssist };
