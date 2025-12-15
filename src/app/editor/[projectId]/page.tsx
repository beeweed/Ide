'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/lib/store';
import { FileSystem } from '@/lib/fileSystem';
import { Sidebar } from '@/components/editor/Sidebar';
import { EditorPane } from '@/components/editor/EditorPane';
import { StatusBar } from '@/components/editor/StatusBar';
import { QuickOpen } from '@/components/editor/QuickOpen';
import {
  Code2,
  Home,
  PanelLeft,
  Menu,
  SplitSquareVertical,
  SplitSquareHorizontal,
  Minus,
  X as CloseIcon,
  Download,
} from 'lucide-react';
import { downloadProjectAsZip } from '@/lib/downloadUtils';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [showMenu, setShowMenu] = useState(false);

  const {
    currentProject,
    setCurrentProject,
    panes,
    splitDirection,
    setSplitDirection,
    sidebarOpen,
    toggleSidebar,
    closePane,
  } = useEditorStore();

  useEffect(() => {
    const project = FileSystem.getProject(projectId);
    if (project) {
      setCurrentProject(project);
    } else {
      router.push('/');
    }
  }, [projectId, setCurrentProject, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        useEditorStore.getState().setQuickOpenVisible(true);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSplitDirection(splitDirection === 'vertical' ? 'none' : 'vertical');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, splitDirection, setSplitDirection]);

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <header className="h-12 bg-slate-950 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Toggle Sidebar (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4 text-gray-300" />
          </button>

          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-500" />
            <span className="font-semibold text-white text-sm">{currentProject.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (currentProject) {
                await downloadProjectAsZip(currentProject);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            title="Download Project"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Download</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4 text-gray-300" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Menu"
            >
              <Menu className="w-4 h-4 text-gray-300" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-white/10 rounded-lg shadow-xl py-1 z-50">
                <button
                  onClick={async () => {
                    if (currentProject) {
                      await downloadProjectAsZip(currentProject);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3"
                >
                  <Download className="w-4 h-4" />
                  Download Project
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => {
                    setSplitDirection('vertical');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3"
                >
                  <SplitSquareVertical className="w-4 h-4" />
                  Split Vertically
                </button>
                <button
                  onClick={() => {
                    setSplitDirection('horizontal');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3"
                >
                  <SplitSquareHorizontal className="w-4 h-4" />
                  Split Horizontally
                </button>
                {panes.length > 1 && (
                  <button
                    onClick={() => {
                      setSplitDirection('none');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3"
                  >
                    <Minus className="w-4 h-4" />
                    Close Split
                  </button>
                )}
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => {
                    toggleSidebar();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3"
                >
                  <PanelLeft className="w-4 h-4" />
                  Toggle Sidebar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex overflow-hidden">
          {splitDirection === 'none' || panes.length === 1 ? (
            <div className="flex-1">
              <EditorPane paneId={panes[0].id} />
            </div>
          ) : splitDirection === 'vertical' ? (
            <>
              <div className="flex-1 border-r border-white/10">
                <EditorPane paneId={panes[0].id} />
              </div>
              <div className="flex-1 relative">
                <EditorPane paneId={panes[1].id} />
                {panes.length > 1 && (
                  <button
                    onClick={() => closePane(panes[1].id)}
                    className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-slate-700 rounded border border-white/10 z-10"
                    title="Close pane"
                  >
                    <CloseIcon className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 border-b border-white/10">
                <EditorPane paneId={panes[0].id} />
              </div>
              <div className="flex-1 relative">
                <EditorPane paneId={panes[1].id} />
                {panes.length > 1 && (
                  <button
                    onClick={() => closePane(panes[1].id)}
                    className="absolute top-2 right-2 p-1 bg-slate-800 hover:bg-slate-700 rounded border border-white/10 z-10"
                    title="Close pane"
                  >
                    <CloseIcon className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <StatusBar />
      <QuickOpen />
    </div>
  );
}
