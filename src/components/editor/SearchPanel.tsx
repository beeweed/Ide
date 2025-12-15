'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store';
import { Search, File } from 'lucide-react';
import { FileSystem } from '@/lib/fileSystem';

export function SearchPanel() {
  const { searchQuery, searchResults, searchInFiles, openFile, currentProject } = useEditorStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchInFiles(localQuery);
  };

  const handleResultClick = (fileId: string) => {
    if (currentProject) {
      const file = FileSystem.findNodeById(currentProject.rootFolder, fileId);
      if (file) {
        openFile(file);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSearch} className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search in files..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </form>

      <div className="flex-1 overflow-auto">
        {searchResults.length === 0 && searchQuery && (
          <div className="p-4 text-center text-gray-400 text-sm">
            No results found for "{searchQuery}"
          </div>
        )}

        {searchResults.length === 0 && !searchQuery && (
          <div className="p-4 text-center text-gray-400 text-sm">
            Enter a search term to find in files
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="p-2">
            <div className="text-xs text-gray-400 px-2 mb-2">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} in {new Set(searchResults.map(r => r.fileId)).size} file{new Set(searchResults.map(r => r.fileId)).size !== 1 ? 's' : ''}
            </div>
            {searchResults.map((result, index) => (
              <div
                key={`${result.fileId}-${result.line}-${index}`}
                onClick={() => handleResultClick(result.fileId)}
                className="px-2 py-2 hover:bg-white/5 rounded cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <File className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300 font-medium">{result.fileName}</span>
                  <span className="text-xs text-gray-500">Line {result.line}</span>
                </div>
                <div className="text-xs text-gray-400 ml-5 truncate font-mono">
                  {result.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
