'use client';

import { useRef, useEffect } from 'react';
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react';
import { useEditorStore } from '@/lib/store';

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  paneId: string;
}

export function MonacoEditor({ value, language, onChange, readOnly = false, paneId }: MonacoEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const { theme, setCursorPosition } = useEditorStore();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        const { panes, activePane, saveFile } = useEditorStore.getState();
        const pane = panes.find(p => p.id === paneId);
        if (pane && pane.activeTabId) {
          saveFile(pane.activeTabId, paneId);
        }
      },
    });

    editor.addAction({
      id: 'save-all-files',
      label: 'Save All Files',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyS],
      run: () => {
        useEditorStore.getState().saveAllFiles();
      },
    });

    editor.addAction({
      id: 'close-tab',
      label: 'Close Tab',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW],
      run: () => {
        const { panes } = useEditorStore.getState();
        const pane = panes.find(p => p.id === paneId);
        if (pane && pane.activeTabId) {
          useEditorStore.getState().closeTab(pane.activeTabId, paneId);
        }
      },
    });

    editor.addAction({
      id: 'quick-open',
      label: 'Quick Open File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      run: () => {
        useEditorStore.getState().setQuickOpenVisible(true);
      },
    });

    editor.addAction({
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
      run: () => {
        useEditorStore.getState().toggleSidebar();
      },
    });

    editor.focus();
  };

  useEffect(() => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      if (position) {
        setCursorPosition({
          line: position.lineNumber,
          column: position.column,
        });
      }
    }
  }, [setCursorPosition]);

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange(val || '')}
      onMount={handleEditorDidMount}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        lineNumbers: 'on',
        folding: true,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        readOnly,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: true,
        autoIndent: 'full',
        bracketPairColorization: {
          enabled: true,
        },
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        find: {
          addExtraSpaceOnTop: false,
          autoFindInSelection: 'never',
          seedSearchStringFromSelection: 'selection',
        },
      }}
    />
  );
}
