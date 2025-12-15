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
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      <header className="h-12 bg-black border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Toggle Sidebar (Ctrl+B)"
          >
            <PanelLeft className="w-4 h-4 text-white/70" />
          </button>

          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-white" />
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
            className="group relative flex items-center gap-2 px-3 py-2 bg-white hover:bg-white/90 text-black rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] overflow-hidden"
            title="Download Project"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Download className="w-4 h-4 relative z-10" />
            <span className="text-sm font-medium relative z-10">Download</span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Home"
          >
            <Home className="w-4 h-4 text-white/70" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Menu"
            >
              <Menu className="w-4 h-4 text-white/70" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-black border border-white/20 rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] py-1 z-50 backdrop-blur-xl">
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
                    className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded border border-white/20 z-10 backdrop-blur-sm"
                    title="Close pane"
                  >
                    <CloseIcon className="w-3 h-3 text-white" />
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
                    className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded border border-white/20 z-10 backdrop-blur-sm"
                    title="Close pane"
                  >
                    <CloseIcon className="w-3 h-3 text-white" />
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
