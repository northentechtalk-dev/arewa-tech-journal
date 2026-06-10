import React, { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, DecoratorNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export type SerializedEcosystemQuoteNode = Spread<
  {
    text: string;
  },
  SerializedLexicalNode
>;

export class EcosystemQuoteNode extends DecoratorNode<React.ReactNode> {
  __text: string;

  static getType(): string {
    return 'ecosystem_quote';
  }

  static clone(node: EcosystemQuoteNode): EcosystemQuoteNode {
    return new EcosystemQuoteNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(key);
    this.__text = text;
  }

  // Getter/Setter to allow editing
  getText(): string {
    return this.__text;
  }

  setText(text: string): void {
    const writable = this.getWritable();
    writable.__text = text;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'block';
    div.className = 'lexical-ecosystem-quote-container my-6';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON(): SerializedEcosystemQuoteNode {
    return {
      type: 'ecosystem_quote',
      version: 1,
      text: this.__text,
    };
  }

  static importJSON(serializedNode: SerializedEcosystemQuoteNode): EcosystemQuoteNode {
    const { text } = serializedNode;
    return new EcosystemQuoteNode(text);
  }

  decorate(): React.ReactNode {
    return <EcosystemQuoteComponent nodeKey={this.__key} initialText={this.__text} />;
  }
}

export function $isEcosystemQuoteNode(node: any): node is EcosystemQuoteNode {
  return node instanceof EcosystemQuoteNode;
}

function EcosystemQuoteComponent({ nodeKey, initialText }: { nodeKey: NodeKey; initialText: string }) {
  const [editor] = useLexicalComposerContext();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);

  const handleSave = () => {
    if (!text.trim()) return;
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isEcosystemQuoteNode(node)) {
        node.setText(text);
      }
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 border border-zinc-800 bg-zinc-950/90 rounded-xl space-y-3 shadow-lg select-none">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-semibold">
          Edit Spotlight Callout
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 min-h-[60px]"
          placeholder="Spotlight blockquote content..."
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-mono text-zinc-400 hover:text-stone-200 transition"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="px-2.5 py-1 bg-accent border border-accent hover:bg-accent-dark rounded-md text-[10px] font-mono text-white font-semibold transition"
          >
            SAVE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group select-none transition-all duration-150">
      <div className="border-l-2 border-white pl-4 italic text-zinc-400 font-mono text-xs leading-relaxed py-1">
        "{text}"
      </div>
      <div className="absolute right-2 top-0 opacity-0 group-hover:opacity-100 transition duration-150 flex gap-1 bg-zinc-950/90 backdrop-blur border border-zinc-900 p-1 rounded shadow-lg">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 px-2 bg-zinc-900 border border-zinc-800/80 rounded text-[9px] font-mono text-zinc-400 hover:text-stone-200 transition"
        >
          EDIT
        </button>
        <button
          onClick={() => {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if (node) node.remove();
            });
          }}
          className="p-1 px-2 bg-zinc-900 border border-red-950/40 rounded text-[9px] font-mono text-red-400 hover:text-red-300 transition"
        >
          DELETE
        </button>
      </div>
    </div>
  );
}
