import React from 'react';
import { motion } from 'motion/react';
import { Quote, Code, ArrowRight } from 'lucide-react';

interface LexicalRendererProps {
  content: any; // Serialized Lexical JSON object or string
}

// Bitmask constants for inline formatting in Lexical
const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 1 << 1;
const FORMAT_STRIKETHROUGH = 1 << 2;
const FORMAT_UNDERLINE = 1 << 3;
const FORMAT_CODE = 1 << 4;

/**
 * Parses inline CSS style strings from Lexical text nodes into React styling objects.
 * (e.g. "font-size: 18px; font-weight: 700; color: #fbbf24;")
 */
function parseInlineStyle(styleString?: string): React.CSSProperties {
  if (!styleString) return {};
  const styleObj: Record<string, string> = {};
  
  styleString.split(';').forEach((statement) => {
    const parts = statement.split(':');
    if (parts.length === 2) {
      const key = parts[0].trim().replace(/-([a-z])/g, (match) => match[1].toUpperCase());
      const value = parts[1].trim();
      styleObj[key] = value;
    }
  });
  
  return styleObj as React.CSSProperties;
}

export default function LexicalRenderer({ content }: LexicalRendererProps) {
  // Parse state
  const parsedState = React.useMemo(() => {
    if (!content) return null;
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch (err) {
        console.error('Failed to parse lexical string input', err);
        return null;
      }
    }
    return content;
  }, [content]);

  // Handle fallback if JSON is corrupted or empty
  if (!parsedState || !parsedState.root) {
    return (
      <p className="text-zinc-500 font-sans italic text-sm">
        No content available to render.
      </p>
    );
  }

  // Render nodes recursively
  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    const key = `node-${node.type || 'text'}-${index}`;

    // Handle Text Node (leaf)
    if (node.type === 'text') {
      const format = node.format || 0;
      const isBold = (format & FORMAT_BOLD) !== 0;
      const isItalic = (format & FORMAT_ITALIC) !== 0;
      const isStrikethrough = (format & FORMAT_STRIKETHROUGH) !== 0;
      const isUnderline = (format & FORMAT_UNDERLINE) !== 0;
      const isCode = (format & FORMAT_CODE) !== 0;

      const inlineStyles = parseInlineStyle(node.style);

      let children: React.ReactNode = node.text || '';

      if (isBold) children = <strong key="b" className="font-bold text-white">{children}</strong>;
      if (isItalic) children = <em key="i" className="italic">{children}</em>;
      if (isStrikethrough) children = <span key="s" className="line-through">{children}</span>;
      if (isUnderline) children = <span key="u" className="underline underline-offset-4">{children}</span>;
      if (isCode) {
        children = (
          <code key="c" className="font-mono text-xs bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-accent-light mx-0.5">
            {children}
          </code>
        );
      }

      return (
        <span key={key} style={inlineStyles}>
          {children}
        </span>
      );
    }

    // Handle Children Containers
    const renderedChildren = Array.isArray(node.children)
      ? node.children.map((child: any, idx: number) => renderNode(child, idx))
      : null;

    // Handle Custom Embedded Image block (from custom ImageNode)
    if (node.type === 'image') {
      const alignClass = 
        node.alignment === 'center' ? 'mx-auto' : 
        node.alignment === 'left' ? 'mr-auto ml-0' : 'ml-auto mr-0';

      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="my-8 text-center"
        >
          <div className={`inline-block border border-zinc-900 overflow-hidden rounded-xl bg-zinc-950 shadow-xl ${alignClass}`} style={{ maxWidth: '100%', width: node.width || '100%' }}>
            <img
              src={node.src}
              alt={node.altText || 'Editorial illustration'}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[500px]"
            />
            {node.caption && (
              <div className="px-5 py-3 border-t border-zinc-900 bg-zinc-950/60 text-center">
                <span className="text-zinc-500 font-sans text-xs italic tracking-wide">
                  {node.caption}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // Handle Custom Embedded Ecosystem Quote highlight (from custom EcosystemQuoteNode)
    if (node.type === 'ecosystem_quote') {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="my-6 border-l-2 border-white pl-4 italic text-zinc-450 font-mono text-xs select-text tracking-normal leading-relaxed py-1 block"
        >
          "{node.text}"
        </motion.div>
      );
    }

    // Handle Paragraph
    if (node.type === 'paragraph') {
      return (
        <p key={key} className="mb-5 leading-relaxed text-stone-300 font-sans text-[15px] sm:text-[16px] select-text">
          {renderedChildren}
        </p>
      );
    }

    // Handle Headings
    if (node.type === 'heading') {
      const Tag = node.tag || 'h2';
      const headingClasses = {
        h1: 'text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white mt-8 mb-4 flex items-center gap-1.5',
        h2: 'text-xl sm:text-2xl font-sans font-bold tracking-tight text-white mt-7 mb-3.5 flex items-center gap-1.5',
        h3: 'text-lg sm:text-xl font-sans font-semibold tracking-tight text-white mt-6 mb-3',
        h4: 'text-base font-sans font-semibold tracking-tight text-stone-200 mt-5 mb-2',
        h5: 'text-sm font-sans font-semibold tracking-tight text-zinc-300 mt-4 mb-2',
      }[Tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5'] || 'text-xl font-sans font-bold text-white';

      return (
        <Tag key={key} className={headingClasses}>
          {renderedChildren}
        </Tag>
      );
    }

    // Handle Blockquote
    if (node.type === 'quote') {
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative border-l-2 border-accent bg-zinc-900/10 p-5 pl-6 my-6 italic text-stone-300 rounded-r-lg font-sans flex gap-3 text-[15px]"
        >
          <Quote className="w-5 h-5 text-accent shrink-0 mt-0.5 opacity-60" />
          <div className="flex-1 space-y-1">
            {renderedChildren}
          </div>
        </motion.div>
      );
    }

    // Handle Lists
    if (node.type === 'list') {
      const Tag = node.tag === 'ol' ? 'ol' : 'ul';
      const listClass = Tag === 'ol' ? 'list-decimal' : 'list-disc';
      return (
        <Tag key={key} className={`${listClass} pl-6 my-5 space-y-1.5 text-stone-300 font-sans text-[15px] sm:text-[16px]`}>
          {renderedChildren}
        </Tag>
      );
    }

    if (node.type === 'listitem') {
      return (
        <li key={key} className="pl-1 leading-relaxed">
          {renderedChildren}
        </li>
      );
    }

    // Handle Link
    if (node.type === 'link') {
      return (
        <a
          key={key}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-light underline underline-offset-4 font-sans cursor-pointer transition duration-150"
        >
          {renderedChildren}
        </a>
      );
    }

    // Handle Code block syntax rendering
    if (node.type === 'code') {
      const codeText = Array.isArray(node.children) 
        ? node.children.map((c: any) => c.text || '').join('\n')
        : '';

      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="my-6 border border-zinc-900 bg-zinc-950/80 rounded-xl overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-mono text-[10px] tracking-widest">
            <div className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-accent" />
              <span>CODE_STRUCTURE_INQUIRY</span>
            </div>
            <span>TS/ESM</span>
          </div>
          <pre className="p-4 overflow-x-auto text-zinc-300 font-mono text-xs leading-relaxed max-h-[380px] select-all whitespace-pre bg-zinc-950/40">
            <code>{codeText}</code>
          </pre>
        </motion.div>
      );
    }

    // Default catch-all wrapper
    if (renderedChildren) {
      return <div key={key}>{renderedChildren}</div>;
    }

    return null;
  };

  // Render all children of root
  return (
    <div className="space-y-4 text-zinc-300 font-sans selection:bg-accent/20">
      {parsedState.root.children.map((child: any, idx: number) => renderNode(child, idx))}
    </div>
  );
}
