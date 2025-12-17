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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const project = await FileSystem.createProject(newProjectName.trim());
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
    <div className="min-h-screen w-full bg-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/80">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shadow-lg shadow-white/20 backdrop-blur-sm border border-white/20">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">WebCode Studio</h1>
                  <p className="text-sm text-white/60">Browser-based Code Editor</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black rounded-xl font-medium transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">New Project</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <FolderOpen className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">No projects yet</h2>
              <p className="text-white/60 mb-8 text-center max-w-md">
                Create your first project to start coding in your browser with full Monaco Editor support
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative flex items-center gap-2 px-8 py-4 bg-white hover:bg-white/90 text-black rounded-xl font-medium transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Create Your First Project</span>
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
                    className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                        <Code2 className="w-6 h-6 text-white" />
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 truncate">{project.name}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.lastModified)}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-white/70">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4">
            <div className="rounded-2xl bg-black border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Create New Project</h3>
              </div>
              
              <form onSubmit={handleCreateProject} className="p-6">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all backdrop-blur-sm"
                  autoFocus
                />
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewProjectName('');
                    }}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all duration-200 border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className="group relative flex-1 px-4 py-3 bg-white hover:bg-white/90 disabled:bg-white/10 text-black disabled:text-white/40 rounded-xl font-medium transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] disabled:shadow-none disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative z-10">Create</span>
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
