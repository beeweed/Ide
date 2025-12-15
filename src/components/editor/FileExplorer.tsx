'use client';

import { useState } from 'react';
import { type FileNode, FileSystem } from '@/lib/fileSystem';
import { useEditorStore } from '@/lib/store';
import { CreateFileModal } from './CreateFileModal';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
} from 'lucide-react';

interface FileExplorerProps {
  rootFolder: FileNode;
}

export function FileExplorer({ rootFolder }: FileExplorerProps) {
  const { currentProject, updateProjectFiles } = useEditorStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [targetFolderId, setTargetFolderId] = useState<string>(rootFolder.id);

  const handleCreateFile = () => {
    setCreateType('file');
    setTargetFolderId(rootFolder.id);
    setShowCreateModal(true);
  };

  const handleCreateFolder = () => {
    setCreateType('folder');
    setTargetFolderId(rootFolder.id);
    setShowCreateModal(true);
  };

  const handleCreate = (name: string) => {
    if (currentProject && name.trim()) {
      if (createType === 'file') {
        FileSystem.createFile(currentProject.rootFolder, targetFolderId, name.trim());
      } else {
        FileSystem.createFolder(currentProject.rootFolder, targetFolderId, name.trim());
      }
      updateProjectFiles(currentProject.rootFolder);
    }
  };

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-2 py-2 border-b border-white/10">
          <span className="text-xs font-semibold text-gray-400 uppercase">Files</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreateFile}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="New File"
            >
              <FilePlus className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={handleCreateFolder}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <FileTreeNode 
            node={rootFolder} 
            level={0}
            onCreateFile={(folderId) => {
              setCreateType('file');
              setTargetFolderId(folderId);
              setShowCreateModal(true);
            }}
            onCreateFolder={(folderId) => {
              setCreateType('folder');
              setTargetFolderId(folderId);
              setShowCreateModal(true);
            }}
          />
        </div>
      </div>

      <CreateFileModal
        isOpen={showCreateModal}
        type={createType}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onCreateFile?: (folderId: string) => void;
  onCreateFolder?: (folderId: string) => void;
}

function FileTreeNode({ node, level, onCreateFile, onCreateFolder }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const { openFile, currentProject, updateProjectFiles } = useEditorStore();

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      openFile(node);
    }
  };

  const handleCreateFile = () => {
    if (onCreateFile) {
      onCreateFile(node.id);
      setIsExpanded(true);
    }
    setShowContextMenu(false);
  };

  const handleCreateFolder = () => {
    if (onCreateFolder) {
      onCreateFolder(node.id);
      setIsExpanded(true);
    }
    setShowContextMenu(false);
  };

  const handleRename = () => {
    setIsRenaming(true);
    setShowContextMenu(false);
  };

  const handleRenameSubmit = () => {
    if (currentProject && newName.trim() && newName !== node.name) {
      FileSystem.renameNode(currentProject.rootFolder, node.id, newName.trim());
      updateProjectFiles(currentProject.rootFolder);
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    if (currentProject && confirm(`Delete ${node.name}?`)) {
      FileSystem.deleteNode(currentProject.rootFolder, node.id);
      updateProjectFiles(currentProject.rootFolder);
    }
    setShowContextMenu(false);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      'js': 'text-yellow-400',
      'jsx': 'text-yellow-400',
      'ts': 'text-blue-400',
      'tsx': 'text-blue-400',
      'html': 'text-orange-400',
      'css': 'text-pink-400',
      'json': 'text-green-400',
      'md': 'text-purple-400',
      'py': 'text-blue-500',
    };
    return colors[ext || ''] || 'text-gray-400';
  };

  return (
    <div>
      <div
        className="group flex items-center gap-1 px-2 py-1 hover:bg-purple-500/20 rounded cursor-pointer relative"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowContextMenu(true);
        }}
        title={level > 0 ? 'Right-click for options' : undefined}
      >
        {node.type === 'folder' && (
          <span className="flex-shrink-0 w-4 h-4">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </span>
        )}
        
        {node.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )
        ) : (
          <File className={`w-4 h-4 flex-shrink-0 ${getFileIcon(node.name)}`} />
        )}

        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') {
                setIsRenaming(false);
                setNewName(node.name);
              }
            }}
            className="flex-1 bg-slate-700 text-white text-sm px-1 rounded outline-none focus:ring-1 focus:ring-purple-500"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm text-gray-200 truncate">{node.name}</span>
        )}

        {node.type === 'folder' && !isRenaming && (
          <div className="hidden group-hover:flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateFile();
              }}
              className="p-1 hover:bg-white/10 rounded"
              title="New File"
            >
              <FilePlus className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateFolder();
              }}
              className="p-1 hover:bg-white/10 rounded"
              title="New Folder"
            >
              <FolderPlus className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}

        {showContextMenu && (
          <div
            className="absolute left-full top-0 ml-2 z-50 bg-slate-800 border border-white/10 rounded-lg shadow-xl py-1 min-w-[150px]"
            onMouseLeave={() => setShowContextMenu(false)}
          >
            {node.type === 'folder' && (
              <>
                <button
                  onClick={handleCreateFile}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <FilePlus className="w-4 h-4" />
                  New File
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>
                <div className="border-t border-white/10 my-1" />
              </>
            )}
            {level > 0 && (
              <>
                <button
                  onClick={handleRename}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'folder' ? -1 : 1;
            })
            .map((child) => (
              <FileTreeNode 
                key={child.id} 
                node={child} 
                level={level + 1}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
              />
            ))}
        </div>
      )}
    </div>
  );
}
