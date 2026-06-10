import React, { useState, useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { registerCodeHighlighting } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
  $createTextNode,
  $createParagraphNode
} from 'lexical';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';

import {
  Heading,
  Quote,
  Bold,
  Italic,
  Underline,
  Code,
  Image as ImageIcon,
  ChevronDown,
  Palette,
  Sparkles,
  Link,
  Smile,
  List,
  ListOrdered
} from 'lucide-react';

import { editorTheme } from './theme';
import { ImageNode } from './nodes/ImageNode';
import { EcosystemQuoteNode } from './nodes/EcosystemQuoteNode';
import OnChangeDebouncedPlugin from './plugins/OnChangeDebouncedPlugin';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';

interface LexicalEditorProps {
  initialContentJson: any; // Stringified JSON or parsed object
  onChange: (jsonStr: string, text: string) => void;
}

// Preset abstract images for instant high-fidelity thumbnails or inline embeds
const IMAGE_PRESETS = [
  {
    title: 'Minimal Workspace',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Grid Architecture',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Editorial Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Lines of Code',
    url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
  }
];

export default function LexicalEditor({ initialContentJson, onChange }: LexicalEditorProps) {
  // Safe initial state setup
  const getInitialState = () => {
    if (!initialContentJson) return null;
    if (typeof initialContentJson === 'string') {
      try {
        return initialContentJson;
      } catch {
        return null;
      }
    }
    return JSON.stringify(initialContentJson);
  };

  const initialConfig = {
    namespace: 'bespoke-editorial-editor',
    theme: editorTheme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      ImageNode,
      EcosystemQuoteNode,
    ],
    onError: (error: Error) => {
      console.error('[Lexical Critical Error]', error);
    },
    editorState: getInitialState(),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative border border-zinc-900 rounded-xl bg-zinc-950/80 overflow-hidden shadow-2xl flex flex-col min-h-[480px]">
        {/* Core Editor Control Deck */}
        <ToolbarPanel />

        {/* Writing Stage */}
        <div className="flex-1 relative flex flex-col p-6 overflow-y-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none flex-1 font-sans text-stone-300 placeholder-zinc-700 min-h-[300px] leading-relaxed select-text" />
            }
            placeholder={
              <div className="absolute top-6 left-6 text-zinc-600 font-sans text-sm pointer-events-none select-none">
                Start scripting your editorial essay here...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <CodeHighlightPlugin />
          <OnChangeDebouncedPlugin onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}

// 1. Code Highlight Plugin register helper
function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);
  return null;
}

// 2. Toolbar Panel housing formatting states and dropdown commands
function ToolbarPanel() {
  const [editor] = useLexicalComposerContext();
  
  // Selected visual state cache
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  
  // Custom design format drawers
  const [showImageInserter, setShowImageInserter] = useState(false);
  const [showEcosystemQuoteInserter, setShowEcosystemQuoteInserter] = useState(false);
  const [ecoQuoteText, setEcoQuoteText] = useState('');

  const [showCodeInserter, setShowCodeInserter] = useState(false);
  const [codeInserterText, setCodeInserterText] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');

  const handleInsertCode = () => {
    if (!codeInserterText.trim()) return;

    editor.update(() => {
      const parentNode = $createCodeNode();
      if (parentNode) {
        parentNode.setLanguage(codeLanguage);
        const textNode = $createTextNode(codeInserterText);
        parentNode.append(textNode);
        
        const paragraphNode = $createParagraphNode();
        $insertNodes([parentNode, paragraphNode]);
        paragraphNode.select();
      }
    });

    setCodeInserterText('');
    setShowCodeInserter(false);
  };

  const handleInsertEcosystemQuote = () => {
    if (!ecoQuoteText.trim()) return;
    
    editor.update(() => {
      const node = new EcosystemQuoteNode(ecoQuoteText);
      $insertNodes([node]);
    });

    setEcoQuoteText('');
    setShowEcosystemQuoteInserter(false);
  };

  // Text layout selection
  const [blockType, setBlockType] = useState<'paragraph' | 'h1' | 'h2' | 'h3' | 'quote' | 'code' | 'ul' | 'ol'>('paragraph');

  // Multi-weight, Multi-size dropdown cache states
  const [fontWeight, setFontWeight] = useState('400');
  const [fontSize, setFontSize] = useState('15px');
  const [textColor, setTextColor] = useState('Default');

  // Track selection features for micro highlights
  const updateToolbar = React.useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsCode(selection.hasFormat('code'));
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  // Command updates:
  const changeBlock = (type: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (type === 'paragraph') {
          $setBlocksType(selection, () => $createHeadingNode('h4')); // Fallback standard block
        } else if (type === 'h1' || type === 'h2' || type === 'h3') {
          $setBlocksType(selection, () => $createHeadingNode(type as HeadingTagType));
        } else if (type === 'quote') {
          $setBlocksType(selection, () => $createQuoteNode());
        } else if (type === 'code') {
          $setBlocksType(selection, () => $createCodeNode());
        }
      }
    });

    if (type === 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else if (type === 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }

    setBlockType(type as any);
  };

  // Set inline styling for custom font features requested by the user
  const applyFontWeight = (weight: string) => {
    setFontWeight(weight);
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-weight': weight });
      }
    });
  };

  const applyFontSize = (sizeStr: string) => {
    setFontSize(sizeStr);
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { 'font-size': sizeStr });
      }
    });
  };

  const applyTextColor = (colorName: string, colorHex: string) => {
    setTextColor(colorName);
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color: colorHex });
      }
    });
  };

  // Image insertion dialog state
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const [imgWidth, setImgWidth] = useState('100%');
  const [imgAlign, setImgAlign] = useState<'left' | 'center' | 'right'>('center');

  const handleInsertImage = () => {
    if (!imgUrl.trim()) return;
    
    editor.update(() => {
      const node = new ImageNode(
        imgUrl,
        imgAlt || 'Editorial inline image',
        imgCaption,
        imgWidth,
        imgAlign
      );
      $insertNodes([node]);
    });

    // Reset Form
    setImgUrl('');
    setImgAlt('');
    setImgCaption('');
    setShowImageInserter(false);
  };

  return (
    <div className="border-b border-zinc-900 bg-zinc-950 p-2 flex flex-col gap-2 shrink-0 select-none">
      {/* 1. Format Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Block Selection dropdown */}
          <div className="relative group/block inline-block">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono font-medium text-stone-300 hover:border-zinc-700">
              <span className="uppercase">Block: {blockType}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            <div className="absolute left-0 mt-1 hidden group-hover/block:block z-50 min-w-44 bg-zinc-900 border border-zinc-800 rounded-lg py-1 shadow-xl">
              <button onClick={() => changeBlock('paragraph')} className="w-full text-left px-3 py-2 text-xs font-sans text-stone-300 hover:bg-zinc-800 flex items-center gap-2">
                <span>Standard Post</span>
              </button>
              <button onClick={() => changeBlock('h1')} className="w-full text-left px-3 py-2 text-xs font-sans font-bold text-stone-300 hover:bg-zinc-800 flex items-center gap-2">
                <span>Heading 1</span>
              </button>
              <button onClick={() => changeBlock('h2')} className="w-full text-left px-3 py-2 text-xs font-sans font-bold text-stone-300 hover:bg-zinc-800 flex items-center gap-2">
                <span>Heading 2</span>
              </button>
              <button onClick={() => changeBlock('h3')} className="w-full text-left px-3 py-2 text-xs font-sans font-semibold text-stone-300 hover:bg-zinc-800 flex items-center gap-2">
                <span>Heading 3</span>
              </button>
              <button onClick={() => changeBlock('quote')} className="w-full text-left px-3 py-2 text-xs font-sans text-stone-300 italic hover:bg-zinc-800 flex items-center gap-2 border-t border-zinc-800/60">
                <Quote className="w-3 h-3 text-accent" />
                <span>Blockquote</span>
              </button>
              <button onClick={() => changeBlock('code')} className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:bg-zinc-800 flex items-center gap-2">
                <Code className="w-3 h-3 text-emerald-500" />
                <span>Code Block</span>
              </button>
              <button onClick={() => changeBlock('ul')} className="w-full text-left px-3 py-2 text-xs font-sans text-stone-300 hover:bg-zinc-800 flex items-center gap-2">
                <List className="w-3 h-3 text-zinc-400" />
                <span>Bullet List</span>
              </button>
              <button onClick={() => changeBlock('ol')} className="w-full text-left px-3 py-2 text-xs font-sans text-stone-300 hover:bg-zinc-800 flex items-center gap-2">
                <ListOrdered className="w-3 h-3 text-zinc-400" />
                <span>Numbered List</span>
              </button>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-zinc-900 mx-1" />

          {/* Standard formatting */}
          <button
            onClick={() => editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.formatText('bold');
              }
            })}
            className={`p-2.5 rounded-lg border transition ${isBold ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-200'}`}
            title="Bold Selection"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.formatText('italic');
              }
            })}
            className={`p-2.5 rounded-lg border transition ${isItalic ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-200'}`}
            title="Italic Selection"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.formatText('underline');
              }
            })}
            className={`p-2.5 rounded-lg border transition ${isUnderline ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-transparent border-zinc-905 text-zinc-500 hover:border-zinc-800 hover:text-zinc-200'}`}
            title="Underline Selection"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setShowCodeInserter(!showCodeInserter);
              setShowImageInserter(false);
              setShowEcosystemQuoteInserter(false);
            }}
            className={`p-2.5 rounded-lg border transition ${showCodeInserter ? 'bg-accent/10 border-accent/30 text-accent-light bg-zinc-900/60' : 'bg-transparent border-zinc-905 text-zinc-500 hover:border-zinc-800 hover:text-zinc-200'}`}
            title="Insert Code block to Article"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-[1px] bg-zinc-900 mx-1" />

          {/* Insert image button */}
          <button
            onClick={() => setShowImageInserter(!showImageInserter)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold select-none transition ${showImageInserter ? 'bg-accent/10 border-accent/30 text-accent-light' : 'bg-transparent border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'}`}
            title="Insert Rich Image Node"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>IMAGE_BLOCK</span>
          </button>

          <button
            onClick={() => setShowEcosystemQuoteInserter(!showEcosystemQuoteInserter)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold select-none transition ${showEcosystemQuoteInserter ? 'bg-accent/10 border-accent/30 text-accent-light' : 'bg-transparent border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'}`}
            title="Insert Ecosystem Spotlight Callout (Monospace design)"
          >
            <Quote className="w-3.5 h-3.5" />
            <span>ECOSYSTEM_CALLOUT</span>
          </button>
        </div>

        {/* 2. Text styling custom sliders */}
        <div className="flex items-center gap-2">
          {/* Font Sizes */}
          <div className="relative group/size inline-block">
            <button className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 hover:border-zinc-700 hover:text-white">
              <span>Size: {fontSize}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover/size:block z-50 min-w-28 bg-zinc-900 border border-zinc-800 rounded-lg py-1 shadow-xl text-center">
              {['12px', '14px', '15px', '18px', '22px', '28px', '36px'].map((sz) => (
                <button key={sz} onClick={() => applyFontSize(sz)} className="w-full text-center px-4 py-1 text-xs font-sans text-stone-300 hover:bg-zinc-800">
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Font Weight */}
          <div className="relative group/weight inline-block">
            <button className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 hover:border-zinc-700 hover:text-white">
              <span>Weight: {fontWeight}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover/weight:block z-50 min-w-32 bg-zinc-900 border border-zinc-800 rounded-lg py-1 shadow-xl">
              {[
                { label: '300 Light', value: '300' },
                { label: '400 Regular', value: '400' },
                { label: '500 Medium', value: '500' },
                { label: '600 Semibold', value: '600' },
                { label: '700 Bold', value: '700' },
                { label: '900 Extra Black', value: '900' }
              ].map((wt) => (
                <button key={wt.value} onClick={() => applyFontWeight(wt.value)} className="w-full text-left px-3 py-1 text-xs font-sans text-stone-300 hover:bg-zinc-800">
                  {wt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color selects */}
          <div className="relative group/color inline-block">
            <button className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 hover:border-zinc-700 hover:text-white">
              <Palette className="w-3 h-3 text-accent" />
              <span>{textColor}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover/color:block z-50 min-w-36 bg-zinc-900 border border-zinc-800 rounded-lg py-1 shadow-xl">
              {[
                { name: 'Default', hex: '#d6d3d1' },
                { name: 'Muted Slate', hex: '#a1a1aa' },
                { name: 'Indigo Aura', hex: '#818cf8' },
                { name: 'Amber Star', hex: '#fbbf24' },
                { name: 'Emerald Glow', hex: '#34d399' },
                { name: 'Crimson Fire', hex: '#f87171' }
              ].map((cl) => (
                <button
                  key={cl.name}
                  onClick={() => applyTextColor(cl.name, cl.hex)}
                  className="w-full text-left px-3 py-1.5 text-xs font-sans flex items-center gap-2 text-stone-300 hover:bg-zinc-800"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cl.hex }} />
                  <span>{cl.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dropdown drawer image block configuration */}
      {showImageInserter && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg mt-2 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono font-medium text-stone-100 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>CONFIGURE GRAPHIC EMBED</span>
            </span>
            <button onClick={() => setShowImageInserter(false)} className="text-stone-500 hover:text-stone-300 font-mono text-[10px]">
              CLOSE_DRAWER
            </button>
          </div>

          {/* Presets Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">IMMEDIATE PRESETS</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  onClick={() => {
                    setImgUrl(preset.url);
                    setImgAlt(preset.title);
                  }}
                  className="p-1 px-2 border border-zinc-800 hover:border-zinc-700 rounded bg-zinc-950/40 text-[10px] font-mono text-zinc-400 hover:text-stone-200 text-left truncate"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">IMAGE URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-stone-200 outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">CAPTURED CAPTION</label>
              <input
                type="text"
                placeholder="e.g., Figures representing dynamic layout grids."
                value={imgCaption}
                onChange={(e) => setImgCaption(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-stone-200 outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">ALIGNMENT</label>
              <select
                value={imgAlign}
                onChange={(e) => setImgAlign(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-stone-200 outline-none"
              >
                <option value="left">LEFT</option>
                <option value="center">CENTER</option>
                <option value="right">RIGHT</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">WIDTH SCALE</label>
              <select
                value={imgWidth}
                onChange={(e) => setImgWidth(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-stone-200 outline-none"
              >
                <option value="100%">100% SCALE</option>
                <option value="75%">75% SCALE</option>
                <option value="50%">50% SCALE</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleInsertImage}
                disabled={!imgUrl.trim()}
                className="w-full bg-accent hover:bg-accent-dark text-white font-mono text-xs font-semibold h-[32px] rounded border border-accent hover:border-accent-dark select-none cursor-pointer duration-150 disabled:opacity-50"
              >
                INSERT_CANVAS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Dropdown drawer Ecosystem Quote callout configuration */}
      {showEcosystemQuoteInserter && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg mt-2 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono font-medium text-stone-100 flex items-center gap-2">
              <Quote className="w-3.5 h-3.5 text-accent" />
              <span>CONFIGURE SPOTLIGHT ECOSYSTEM CALLOUT</span>
            </span>
            <button onClick={() => setShowEcosystemQuoteInserter(false)} className="text-stone-500 hover:text-stone-300 font-mono text-[10px]">
              CLOSE_DRAWER
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">PRESET INSTANT EXCELELENCE TEXTS</span>
            <button
              onClick={() => setEcoQuoteText('If we teach our youth to only assemble template landing pages, we keep them as consumer-level engineers. If we teach them core compiler engineering, network pipelines, and database optimizations, we create international pioneers.')}
              className="p-2 border border-zinc-800 hover:border-zinc-700 rounded-lg bg-zinc-950/40 text-[10px] font-mono text-zinc-400 hover:text-stone-200 text-left w-full hover:bg-zinc-950/80 leading-relaxed block overflow-hidden text-ellipsis"
            >
              "If we teach our youth to only assemble template landing pages..."
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">QUOTE CONTENT</label>
            <textarea
              placeholder="Paste or type system-level quote or spotlight message here..."
              value={ecoQuoteText}
              onChange={(e) => setEcoQuoteText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-2.5 text-xs text-stone-200 outline-none focus:border-zinc-700 min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleInsertEcosystemQuote}
              disabled={!ecoQuoteText.trim()}
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-white font-mono text-xs font-semibold rounded border border-accent hover:border-accent-dark select-none cursor-pointer duration-150 disabled:opacity-50"
            >
              INSERT_CALLOUT
            </button>
          </div>
        </div>
      )}

      {/* 5. Dropdown drawer Code syntax block configuration */}
      {showCodeInserter && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg mt-2 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-mono font-medium text-stone-100 flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-accent animate-pulse-subtle" />
              <span>CONFIGURE CODE BLOCK EMBED</span>
            </span>
            <button onClick={() => setShowCodeInserter(false)} className="text-stone-500 hover:text-stone-300 font-mono text-[10px]">
              CLOSE_DRAWER
            </button>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">CODE SAMPLES / TEMPLATES</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setCodeLanguage('typescript');
                  setCodeInserterText(`export function useDampedSpring(target: number) {\n  const [value, setValue] = useState(0);\n  useEffect(() => {\n    // Micro-interactions must feel elastic, with short 150ms curves\n    const spring = animateSpring(value, target, (v) => setValue(v));\n    return () => spring.destroy();\n  }, [target]);\n  return value;\n}`);
                }}
                className="p-1 px-2 border border-zinc-805 hover:border-zinc-700 rounded bg-zinc-950/40 text-[10px] font-mono text-zinc-400 hover:text-stone-200"
              >
                TS Spring Animation
              </button>
              <button
                onClick={() => {
                  setCodeLanguage('rust');
                  setCodeInserterText(`fn compile_ast(ast: AST) -> Result<Binary, CompilerError> {\n    // Optimizing instruction layouts & caching registers\n    let mut emitter = CodeEmitter::new();\n    for node in ast.nodes {\n        emitter.emit_x84_64(node)?;\n    }\n    Ok(emitter.assemble())\n}`);
                }}
                className="p-1 px-2 border border-zinc-805 hover:border-zinc-700 rounded bg-zinc-950/40 text-[10px] font-mono text-zinc-400 hover:text-stone-200"
              >
                Rust Compiler Boilerplate
              </button>
              <button
                onClick={() => {
                  setCodeLanguage('javascript');
                  setCodeInserterText(`const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\nconst response = await ai.models.generateContent({\n  model: 'gemini-2.5-flash',\n  contents: 'List 3 core compiler design pillars.',\n});\nconsole.log(response.text);`);
                }}
                className="p-1 px-2 border border-zinc-805 hover:border-zinc-700 rounded bg-zinc-950/40 text-[10px] font-mono text-zinc-400 hover:text-stone-200"
              >
                SDK Integration
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">LANGUAGE / TAG</label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-stone-200 outline-none"
              >
                <option value="typescript">TYPESCRIPT</option>
                <option value="rust">RUST</option>
                <option value="golang">GO</option>
                <option value="python">PYTHON</option>
                <option value="javascript">JAVASCRIPT</option>
                <option value="shell">SHELL / BASH</option>
              </select>
            </div>
            
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">CODE / SCRIPT</label>
              <textarea
                placeholder="Type or paste high-quality compiler algorithms, async streams, or ui helpers here..."
                value={codeInserterText}
                onChange={(e) => setCodeInserterText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-805 rounded px-2.5 py-2 text-xs text-stone-200 outline-none focus:border-zinc-700 min-h-[140px] font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleInsertCode}
              disabled={!codeInserterText.trim()}
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-white font-mono text-xs font-semibold rounded border border-accent hover:border-accent-dark select-none cursor-pointer duration-150 disabled:opacity-50"
            >
              INSERT_CODE_BLOCK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
