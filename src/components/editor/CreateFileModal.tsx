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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md mx-4 rounded-xl bg-black border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            {type === 'file' ? (
              <File className="w-5 h-5 text-white" />
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
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-white/70 mb-2">
            {type === 'file' ? 'File' : 'Folder'} Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'file' ? 'example.js' : 'folder-name'}
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all backdrop-blur-sm"
            autoFocus
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-all duration-200 border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="group relative flex-1 px-4 py-3 bg-white hover:bg-white/90 disabled:bg-white/10 text-black disabled:text-white/40 rounded-lg font-medium transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] disabled:shadow-none disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10">Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
