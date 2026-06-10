import React from 'react';
import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    caption: string;
    width: string;
    alignment: 'left' | 'center' | 'right';
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText: string;
  __caption: string;
  __width: string;
  __alignment: 'left' | 'center' | 'right';

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__caption,
      node.__width,
      node.__alignment,
      node.__key
    );
  }

  constructor(
    src: string,
    altText: string,
    caption: string,
    width: string,
    alignment: 'left' | 'center' | 'right',
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__caption = caption;
    this.__width = width;
    this.__alignment = alignment;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.style.display = 'block';
    span.style.textAlign = this.__alignment;
    span.className = 'lexical-image-container';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      altText: this.__altText,
      caption: this.__caption,
      width: this.__width,
      alignment: this.__alignment,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, caption, width, alignment } = serializedNode;
    return new ImageNode(src, altText, caption, width, alignment);
  }

  decorate(): React.ReactNode {
    const alignmentClass = 
      this.__alignment === 'center' ? 'mx-auto' : 
      this.__alignment === 'left' ? 'mr-auto ml-0' : 'ml-auto mr-0';

    return (
      <div 
        className="my-6 text-center select-none"
        id={`image-node-${this.getKey()}`}
      >
        <div className={`inline-block border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900 ${alignmentClass}`} style={{ maxWidth: '100%', width: this.__width || '100%' }}>
          <img
            src={this.__src}
            alt={this.__altText || 'Editorial illustration'}
            referrerPolicy="no-referrer"
            className="w-full h-auto object-cover max-h-[460px]"
          />
          {this.__caption && (
            <div className="px-4 py-2 bg-zinc-90 w-full border-t border-zinc-800 text-center">
              <span className="text-zinc-500 font-sans text-xs italic">
                {this.__caption}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
