'use client';

import { useEditorStore } from '@/lib/store';
import { Sun, Moon, FileCode, GitBranch } from 'lucide-react';

export function StatusBar() {
  const { panes, activePane, cursorPosition, theme, toggleTheme, currentProject } = useEditorStore();
  const pane = panes.find((p) => p.id === activePane);
  const activeTab = pane?.tabs.find((t) => t.id === pane.activeTabId);

  return (
    <div className="flex items-center justify-between px-4 py-1 bg-purple-600 text-white text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3 h-3" />
          <span className="font-medium">{currentProject?.name || 'No project'}</span>
        </div>

        {activeTab && (
          <>
            <div className="h-3 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <FileCode className="w-3 h-3" />
              <span>{activeTab.fileName}</span>
            </div>

            <div className="h-3 w-px bg-white/30" />
            <span className="text-white/80 uppercase">{activeTab.language}</span>

            {activeTab.isDirty && (
              <>
                <div className="h-3 w-px bg-white/30" />
                <span className="text-yellow-300">Modified</span>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            <span>
              Ln {cursorPosition.line}, Col {cursorPosition.column}
            </span>
            <div className="h-3 w-px bg-white/30" />
            <span>Spaces: 2</span>
            <div className="h-3 w-px bg-white/30" />
            <span>UTF-8</span>
            <div className="h-3 w-px bg-white/30" />
          </>
        )}
        
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/10 rounded transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3" />
              <span>Light</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
