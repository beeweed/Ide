'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSystem, type Project } from '@/lib/fileSystem';
import { Code2, Plus, Trash2, FolderOpen, Calendar } from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = FileSystem.getAllProjects();
    setProjects(allProjects.sort((a, b) => b.lastModified - a.lastModified));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const project = FileSystem.createProject(newProjectName.trim());
      setShowCreateModal(false);
      setNewProjectName('');
      router.push(`/editor/${project.id}`);
    }
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      FileSystem.deleteProject(projectId);
      loadProjects();
    }
  };

  const handleOpenProject = (projectId: string) => {
    router.push(`/editor/${projectId}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">WebCode Studio</h1>
                  <p className="text-sm text-purple-300">Browser-based Code Editor</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-purple-500/20">
                <FolderOpen className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">No projects yet</h2>
              <p className="text-purple-300 mb-8 text-center max-w-md">
                Create your first project to start coding in your browser with full Monaco Editor support
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Your Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleOpenProject(project.id)}
                    className="group relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                        <Code2 className="w-6 h-6 text-purple-400" />
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 truncate">{project.name}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-purple-300">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.lastModified)}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-purple-400">
                        <FolderOpen className="w-3 h-3" />
                        <span>{project.rootFolder.children?.length || 0} files</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4">
            <div className="rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Create New Project</h3>
              </div>
              
              <form onSubmit={handleCreateProject} className="p-6">
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  autoFocus
                />
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewProjectName('');
                    }}
                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/30 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
