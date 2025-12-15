import { create } from 'zustand';
import { type FileNode, type Project, FileSystem } from './fileSystem';

export interface Tab {
  id: string;
  fileId: string;
  fileName: string;
  filePath: string;
  content: string;
  isDirty: boolean;
  language: string;
}

export interface EditorPane {
  id: string;
  activeTabId: string | null;
  tabs: Tab[];
}

export type SplitDirection = 'none' | 'vertical' | 'horizontal';

export interface CursorPosition {
  line: number;
  column: number;
}

interface EditorState {
  currentProject: Project | null;
  activePane: string;
  panes: EditorPane[];
  splitDirection: SplitDirection;
  sidebarOpen: boolean;
  activeSidebarPanel: 'explorer' | 'search';
  theme: 'light' | 'dark';
  cursorPosition: CursorPosition;
  searchQuery: string;
  searchResults: { fileId: string; fileName: string; line: number; text: string }[];
  quickOpenVisible: boolean;
  
  setCurrentProject: (project: Project | null) => void;
  updateProjectFiles: (rootFolder: FileNode) => void;
  openFile: (file: FileNode, paneId?: string) => void;
  closeTab: (tabId: string, paneId: string) => void;
  setActiveTab: (tabId: string, paneId: string) => void;
  updateTabContent: (tabId: string, content: string, paneId: string) => void;
  saveFile: (tabId: string, paneId: string) => void;
  saveAllFiles: () => void;
  setSplitDirection: (direction: SplitDirection) => void;
  toggleSidebar: () => void;
  setActiveSidebarPanel: (panel: 'explorer' | 'search') => void;
  toggleTheme: () => void;
  setCursorPosition: (position: CursorPosition) => void;
  searchInFiles: (query: string) => void;
  setQuickOpenVisible: (visible: boolean) => void;
  closePane: (paneId: string) => void;
  setActivePane: (paneId: string) => void;
  getActiveTab: (paneId: string) => Tab | null;
}

const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
    'txt': 'plaintext',
  };
  return languageMap[ext || ''] || 'plaintext';
};

export const useEditorStore = create<EditorState>((set, get) => ({
  currentProject: null,
  activePane: 'pane-1',
  panes: [
    {
      id: 'pane-1',
      activeTabId: null,
      tabs: [],
    },
  ],
  splitDirection: 'none',
  sidebarOpen: true,
  activeSidebarPanel: 'explorer',
  theme: 'dark',
  cursorPosition: { line: 1, column: 1 },
  searchQuery: '',
  searchResults: [],
  quickOpenVisible: false,

  setCurrentProject: (project) => set({ currentProject: project }),

  updateProjectFiles: (rootFolder) => {
    const { currentProject } = get();
    if (currentProject) {
      const updated = { ...currentProject, rootFolder };
      set({ currentProject: updated });
      FileSystem.updateProject(updated);
    }
  },

  openFile: (file, paneId) => {
    const { panes, activePane, currentProject } = get();
    const targetPaneId = paneId || activePane;
    const targetPane = panes.find(p => p.id === targetPaneId);
    
    if (!targetPane || !currentProject) return;

    const existingTab = targetPane.tabs.find(t => t.fileId === file.id);
    
    if (existingTab) {
      set({
        panes: panes.map(p =>
          p.id === targetPaneId
            ? { ...p, activeTabId: existingTab.id }
            : p
        ),
      });
    } else {
      const filePath = FileSystem.getFilePath(currentProject.rootFolder, file.id);
      const newTab: Tab = {
        id: crypto.randomUUID(),
        fileId: file.id,
        fileName: file.name,
        filePath,
        content: file.content || '',
        isDirty: false,
        language: getLanguageFromFileName(file.name),
      };

      set({
        panes: panes.map(p =>
          p.id === targetPaneId
            ? { ...p, tabs: [...p.tabs, newTab], activeTabId: newTab.id }
            : p
        ),
      });
    }
  },

  closeTab: (tabId, paneId) => {
    const { panes } = get();
    const pane = panes.find(p => p.id === paneId);
    if (!pane) return;

    const tabIndex = pane.tabs.findIndex(t => t.id === tabId);
    const newTabs = pane.tabs.filter(t => t.id !== tabId);
    
    let newActiveTabId = pane.activeTabId;
    if (pane.activeTabId === tabId) {
      if (newTabs.length > 0) {
        const nextIndex = Math.min(tabIndex, newTabs.length - 1);
        newActiveTabId = newTabs[nextIndex].id;
      } else {
        newActiveTabId = null;
      }
    }

    set({
      panes: panes.map(p =>
        p.id === paneId
          ? { ...p, tabs: newTabs, activeTabId: newActiveTabId }
          : p
      ),
    });
  },

  setActiveTab: (tabId, paneId) => {
    const { panes } = get();
    set({
      panes: panes.map(p =>
        p.id === paneId
          ? { ...p, activeTabId: tabId }
          : p
      ),
      activePane: paneId,
    });
  },

  updateTabContent: (tabId, content, paneId) => {
    const { panes } = get();
    set({
      panes: panes.map(p =>
        p.id === paneId
          ? {
              ...p,
              tabs: p.tabs.map(t =>
                t.id === tabId
                  ? { ...t, content, isDirty: true }
                  : t
              ),
            }
          : p
      ),
    });
  },

  saveFile: (tabId, paneId) => {
    const { panes, currentProject } = get();
    if (!currentProject) return;

    const pane = panes.find(p => p.id === paneId);
    const tab = pane?.tabs.find(t => t.id === tabId);
    
    if (tab) {
      FileSystem.updateFileContent(currentProject.rootFolder, tab.fileId, tab.content);
      FileSystem.updateProject(currentProject);

      set({
        panes: panes.map(p =>
          p.id === paneId
            ? {
                ...p,
                tabs: p.tabs.map(t =>
                  t.id === tabId
                    ? { ...t, isDirty: false }
                    : t
                ),
              }
            : p
        ),
      });
    }
  },

  saveAllFiles: () => {
    const { panes } = get();
    for (const pane of panes) {
      for (const tab of pane.tabs) {
        if (tab.isDirty) {
          get().saveFile(tab.id, pane.id);
        }
      }
    }
  },

  setSplitDirection: (direction) => {
    const { panes } = get();
    
    if (direction === 'none') {
      set({
        splitDirection: direction,
        panes: [panes[0]],
        activePane: panes[0].id,
      });
    } else if (panes.length === 1) {
      set({
        splitDirection: direction,
        panes: [
          panes[0],
          {
            id: 'pane-2',
            activeTabId: null,
            tabs: [],
          },
        ],
      });
    } else {
      set({ splitDirection: direction });
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setActiveSidebarPanel: (panel) => set({ activeSidebarPanel: panel }),

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  setCursorPosition: (position) => set({ cursorPosition: position }),

  searchInFiles: (query) => {
    const { currentProject } = get();
    if (!currentProject || !query) {
      set({ searchQuery: query, searchResults: [] });
      return;
    }

    const results: { fileId: string; fileName: string; line: number; text: string }[] = [];
    const files = FileSystem.getAllFiles(currentProject.rootFolder);

    for (const file of files) {
      const lines = (file.content || '').split('\n');
      for (const [index, text] of lines.entries()) {
        if (text.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            fileId: file.id,
            fileName: file.name,
            line: index + 1,
            text: text.trim(),
          });
        }
      }
    }

    set({ searchQuery: query, searchResults: results });
  },

  setQuickOpenVisible: (visible) => set({ quickOpenVisible: visible }),

  closePane: (paneId) => {
    const { panes, activePane } = get();
    if (panes.length === 1) return;

    const newPanes = panes.filter(p => p.id !== paneId);
    const newActivePane = activePane === paneId ? newPanes[0].id : activePane;

    set({
      panes: newPanes,
      activePane: newActivePane,
      splitDirection: 'none',
    });
  },

  setActivePane: (paneId) => set({ activePane: paneId }),

  getActiveTab: (paneId) => {
    const { panes } = get();
    const pane = panes.find(p => p.id === paneId);
    if (!pane || !pane.activeTabId) return null;
    return pane.tabs.find(t => t.id === pane.activeTabId) || null;
  },
}));
