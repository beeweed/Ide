export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  parentId?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  rootFolder: FileNode;
}

const PROJECTS_KEY = 'vscode-web-projects';

// Fetch template from API
async function fetchTemplate(): Promise<FileNode[]> {
  try {
    const response = await fetch('/api/template');
    const data = await response.json();
    
    if (data.success && data.template) {
      return data.template;
    }
  } catch (error) {
    console.error('Failed to fetch template:', error);
  }
  
  // Fallback to empty array if template fetch fails
  return [];
}

export class FileSystem {
  static getAllProjects(): Project[] {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getProject(projectId: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  static async createProject(name: string): Promise<Project> {
    const templateFiles = await fetchTemplate();
    
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      lastModified: Date.now(),
      rootFolder: {
        id: crypto.randomUUID(),
        name: name,
        type: 'folder',
        children: templateFiles,
      },
    };

    const projects = this.getAllProjects();
    projects.push(project);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return project;
  }

  static updateProject(project: Project): void {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      project.lastModified = Date.now();
      projects[index] = project;
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  }

  static deleteProject(projectId: string): void {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  }

  static findNodeById(node: FileNode, id: string): FileNode | null {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  static findParentNode(root: FileNode, childId: string): FileNode | null {
    if (root.children) {
      for (const child of root.children) {
        if (child.id === childId) return root;
        const found = this.findParentNode(child, childId);
        if (found) return found;
      }
    }
    return null;
  }

  static createFile(root: FileNode, parentId: string, name: string, content = ''): FileNode {
    const parent = this.findNodeById(root, parentId);
    if (!parent || parent.type !== 'folder') {
      throw new Error('Parent folder not found');
    }

    const newFile: FileNode = {
      id: crypto.randomUUID(),
      name,
      type: 'file',
      content,
      parentId,
    };

    if (!parent.children) parent.children = [];
    parent.children.push(newFile);
    return newFile;
  }

  static createFolder(root: FileNode, parentId: string, name: string): FileNode {
    const parent = this.findNodeById(root, parentId);
    if (!parent || parent.type !== 'folder') {
      throw new Error('Parent folder not found');
    }

    const newFolder: FileNode = {
      id: crypto.randomUUID(),
      name,
      type: 'folder',
      children: [],
      parentId,
    };

    if (!parent.children) parent.children = [];
    parent.children.push(newFolder);
    return newFolder;
  }

  static renameNode(root: FileNode, nodeId: string, newName: string): void {
    const node = this.findNodeById(root, nodeId);
    if (node) {
      node.name = newName;
    }
  }

  static deleteNode(root: FileNode, nodeId: string): void {
    const parent = this.findParentNode(root, nodeId);
    if (parent && parent.children) {
      parent.children = parent.children.filter(child => child.id !== nodeId);
    }
  }

  static updateFileContent(root: FileNode, fileId: string, content: string): void {
    const node = this.findNodeById(root, fileId);
    if (node && node.type === 'file') {
      node.content = content;
    }
  }

  static getAllFiles(node: FileNode, files: FileNode[] = []): FileNode[] {
    if (node.type === 'file') {
      files.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        this.getAllFiles(child, files);
      }
    }
    return files;
  }

  static getFilePath(root: FileNode, fileId: string): string {
    const path: string[] = [];
    
    const buildPath = (node: FileNode, targetId: string): boolean => {
      if (node.id === targetId) {
        path.unshift(node.name);
        return true;
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (buildPath(child, targetId)) {
            if (node.name !== root.name) {
              path.unshift(node.name);
            }
            return true;
          }
        }
      }
      
      return false;
    };
    
    buildPath(root, fileId);
    return path.join('/');
  }
}
