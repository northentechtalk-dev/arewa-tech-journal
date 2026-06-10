import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

interface OnChangeDebouncedPluginProps {
  onChange: (jsonStr: string, text: string) => void;
  debounceMs?: number;
}

export default function OnChangeDebouncedPlugin({
  onChange,
  debounceMs = 300,
}: OnChangeDebouncedPluginProps) {
  const [editor] = useLexicalComposerContext();
  const callbackRef = useRef(onChange);

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let timeoutId: any;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        editorState.read(() => {
          const root = $getRoot();
          const textContent = root.getTextContent();
          try {
            const rawJson = editorState.toJSON();
            const jsonString = JSON.stringify(rawJson);
            callbackRef.current(jsonString, textContent);
          } catch (err) {
            console.error('Error stringifying EditorState:', err);
          }
        });
      }, debounceMs);
    });

    return () => {
      unregister();
      clearTimeout(timeoutId);
    };
  }, [editor, debounceMs]);

  return null;
}
