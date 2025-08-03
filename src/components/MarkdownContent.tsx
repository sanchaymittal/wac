import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className = '' }) => {
  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        components={{
        // Style headings
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-foreground mb-3 mt-4 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-foreground mb-2 mt-3 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-foreground mb-2 mt-3 first:mt-0">{children}</h3>
        ),
        
        // Style paragraphs
        p: ({ children }) => (
          <p className="text-sm leading-relaxed text-foreground mb-3 last:mb-0">{children}</p>
        ),
        
        // Style lists
        ul: ({ children }) => (
          <ul className="text-sm leading-relaxed text-foreground mb-3 ml-4 space-y-1 list-disc list-outside">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="text-sm leading-relaxed text-foreground mb-3 ml-4 space-y-1 list-decimal list-outside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm leading-relaxed">{children}</li>
        ),
        
        // Style code
        code: ({ children }) => (
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
            {children}
          </code>
        ),
        
        // Style blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-accent pl-4 py-2 bg-accent/20 rounded-r-lg mb-3 text-sm italic text-muted-foreground">
            {children}
          </blockquote>
        ),
        
        // Style links
        a: ({ children, href }) => (
          <a 
            href={href} 
            className="text-primary hover:text-primary/80 underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        
        // Style strong/bold text
        strong: ({ children }) => (
          <strong className="font-bold text-foreground">{children}</strong>
        ),
        
        // Style emphasis/italic text
        em: ({ children }) => (
          <em className="italic text-foreground">{children}</em>
        ),
        
        // Style horizontal rules
        hr: () => (
          <hr className="border-border my-4" />
        ),
        
        // Style tables
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border border-border rounded-lg">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody>{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-border">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-xs font-medium text-foreground border-r border-border last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-xs text-foreground border-r border-border last:border-r-0">
            {children}
          </td>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};