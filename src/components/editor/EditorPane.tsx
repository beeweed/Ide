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
      className={`flex flex-col h-full ${activePane === paneId ? 'ring-1 ring-white/30' : ''}`}
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
    <div className="flex-1 flex flex-col items-center justify-center bg-black text-white/60">
      <Code2 className="w-16 h-16 mb-4 text-white/20" />
      <h3 className="text-lg font-semibold mb-2 text-white">No file open</h3>
      <p className="text-sm mb-4">Select a file from the explorer or use quick open</p>
      {currentProject && (
        <button
          onClick={() => setQuickOpenVisible(true)}
          className="group relative px-4 py-2 bg-white hover:bg-white/90 text-black rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative z-10">Quick Open (Ctrl+P)</span>
        </button>
      )}
    </div>
  );
}
