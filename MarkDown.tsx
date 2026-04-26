import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkDownProps {
  content: string;
}

export function MarkDown({ content }: MarkDownProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
