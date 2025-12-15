'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/lib/store';
import { FileSystem, type FileNode } from '@/lib/fileSystem';
import { Search, File } from 'lucide-react';

export function QuickOpen() {
  const { quickOpenVisible, setQuickOpenVisible, currentProject, openFile } = useEditorStore();
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentProject) {
      const allFiles = FileSystem.getAllFiles(currentProject.rootFolder);
      setFiles(allFiles);
    }
  }, [currentProject]);

  useEffect(() => {
    if (quickOpenVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quickOpenVisible]);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredFiles.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredFiles.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFiles[selectedIndex]) {
        openFile(filteredFiles[selectedIndex]);
        handleClose();
      }
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    setQuickOpenVisible(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const handleFileClick = (file: FileNode) => {
    openFile(file);
    handleClose();
  };

  if (!quickOpenVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-xl bg-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-white/10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search files..."
            className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-lg"
          />
        </div>

        <div className="max-h-[400px] overflow-auto">
          {filteredFiles.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {query ? `No files found matching "${query}"` : 'No files in project'}
            </div>
          ) : (
            <div className="py-2">
              {filteredFiles.map((file, index) => {
                const filePath = currentProject
                  ? FileSystem.getFilePath(currentProject.rootFolder, file.id)
                  : file.name;

                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className={`
                      flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                      ${index === selectedIndex ? 'bg-purple-600 text-white' : 'hover:bg-white/5 text-gray-300'}
                    `}
                  >
                    <File className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className={`text-xs truncate ${index === selectedIndex ? 'text-purple-200' : 'text-gray-500'}`}>
                        {filePath}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/10 bg-slate-950 text-xs text-gray-400 flex items-center justify-between">
          <span>Use ↑↓ to navigate</span>
          <span>↵ to open • ESC to close</span>
        </div>
      </div>
    </div>
  );
}
