'use client';

import { useState } from 'react';
import { X, File, Folder } from 'lucide-react';

interface CreateFileModalProps {
  isOpen: boolean;
  type: 'file' | 'folder';
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function CreateFileModal({ isOpen, type, onClose, onCreate }: CreateFileModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md mx-4 rounded-xl bg-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            {type === 'file' ? (
              <File className="w-5 h-5 text-purple-400" />
            ) : (
              <Folder className="w-5 h-5 text-blue-400" />
            )}
            <h3 className="text-lg font-semibold text-white">
              Create New {type === 'file' ? 'File' : 'Folder'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-purple-300 mb-2">
            {type === 'file' ? 'File' : 'Folder'} Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'file' ? 'example.js' : 'folder-name'}
            className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            autoFocus
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-purple-500/30 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
