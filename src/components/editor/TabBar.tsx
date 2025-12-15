'use client';

import { useEditorStore, type Tab } from '@/lib/store';
import { X, Circle } from 'lucide-react';

interface TabBarProps {
  paneId: string;
}

export function TabBar({ paneId }: TabBarProps) {
  const { panes, setActiveTab, closeTab, saveFile } = useEditorStore();
  const pane = panes.find((p) => p.id === paneId);

  if (!pane) return null;

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id, paneId);
  };

  const handleCloseTab = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    
    if (tab.isDirty) {
      const shouldSave = confirm(`Save changes to ${tab.fileName}?`);
      if (shouldSave) {
        saveFile(tab.id, paneId);
      }
    }
    
    closeTab(tab.id, paneId);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      'js': 'bg-yellow-400',
      'jsx': 'bg-yellow-400',
      'ts': 'bg-blue-400',
      'tsx': 'bg-blue-400',
      'html': 'bg-orange-400',
      'css': 'bg-pink-400',
      'json': 'bg-green-400',
      'md': 'bg-purple-400',
      'py': 'bg-blue-500',
    };
    return colors[ext || ''] || 'bg-gray-400';
  };

  return (
    <div className="flex items-center bg-black border-b border-white/10 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {pane.tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab)}
          className={`
            group flex items-center gap-2 px-4 py-2 border-r border-white/10 cursor-pointer min-w-[120px] max-w-[200px] relative
            ${tab.id === pane.activeTabId 
              ? 'bg-white/5 text-white' 
              : 'bg-black text-white/60 hover:bg-white/5 hover:text-white/80'
            }
          `}
        >
          <div className={`w-2 h-2 rounded-full ${getFileIcon(tab.fileName)}`} />
          
          <span className="flex-1 text-sm truncate" title={tab.filePath}>
            {tab.fileName}
          </span>

          {tab.isDirty && (
            <Circle className="w-2 h-2 fill-blue-400 text-blue-400 flex-shrink-0" />
          )}

          <button
            onClick={(e) => handleCloseTab(e, tab)}
            className="flex-shrink-0 p-0.5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>

          {tab.id === pane.activeTabId && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          )}
        </div>
      ))}
    </div>
  );
}
