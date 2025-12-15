'use client';

import { useEditorStore } from '@/lib/store';
import { MonacoEditor } from './MonacoEditor';
import { TabBar } from './TabBar';
import { Code2 } from 'lucide-react';

interface EditorPaneProps {
  paneId: string;
}

export function EditorPane({ paneId }: EditorPaneProps) {
  const { panes, updateTabContent, saveFile, setActivePane, activePane } = useEditorStore();
  const pane = panes.find((p) => p.id === paneId);
  const activeTab = pane?.tabs.find((t) => t.id === pane.activeTabId);

  if (!pane) return null;

  const handleContentChange = (content: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, content, paneId);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full ${activePane === paneId ? 'ring-1 ring-purple-500/50' : ''}`}
      onClick={() => setActivePane(paneId)}
    >
      {pane.tabs.length > 0 ? (
        <>
          <TabBar paneId={paneId} />
          {activeTab ? (
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                value={activeTab.content}
                language={activeTab.language}
                onChange={handleContentChange}
                paneId={paneId}
              />
            </div>
          ) : (
            <EmptyEditor />
          )}
        </>
      ) : (
        <EmptyEditor />
      )}
    </div>
  );
}

function EmptyEditor() {
  const { currentProject, setQuickOpenVisible } = useEditorStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-gray-400">
      <Code2 className="w-16 h-16 mb-4 text-purple-500/30" />
      <h3 className="text-lg font-semibold mb-2">No file open</h3>
      <p className="text-sm mb-4">Select a file from the explorer or use quick open</p>
      {currentProject && (
        <button
          onClick={() => setQuickOpenVisible(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors"
        >
          Quick Open (Ctrl+P)
        </button>
      )}
    </div>
  );
}
