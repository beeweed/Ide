'use client';

import { useEditorStore } from '@/lib/store';
import { FileExplorer } from './FileExplorer';
import { SearchPanel } from './SearchPanel';
import { Files, Search } from 'lucide-react';

export function Sidebar() {
  const { sidebarOpen, activeSidebarPanel, setActiveSidebarPanel, currentProject } = useEditorStore();

  if (!sidebarOpen || !currentProject) return null;

  return (
    <div className="flex h-full bg-black border-r border-white/10">
      <div className="w-12 bg-black border-r border-white/10 flex flex-col items-center py-2 gap-1">
        <button
          onClick={() => setActiveSidebarPanel('explorer')}
          className={`
            w-10 h-10 flex items-center justify-center rounded transition-colors
            ${activeSidebarPanel === 'explorer' 
              ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
            }
          `}
          title="Explorer"
        >
          <Files className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setActiveSidebarPanel('search')}
          className={`
            w-10 h-10 flex items-center justify-center rounded transition-colors
            ${activeSidebarPanel === 'search' 
              ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
              : 'text-white/60 hover:text-white hover:bg-white/5'
            }
          `}
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-[250px] max-w-[400px]">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            {activeSidebarPanel === 'explorer' ? 'Explorer' : 'Search'}
          </h2>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeSidebarPanel === 'explorer' && (
            <FileExplorer rootFolder={currentProject.rootFolder} />
          )}
          {activeSidebarPanel === 'search' && <SearchPanel />}
        </div>
      </div>
    </div>
  );
}
