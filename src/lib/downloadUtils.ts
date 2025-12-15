import JSZip from 'jszip';
import { FileNode, Project } from './fileSystem';

export async function downloadProjectAsZip(project: Project): Promise<void> {
  const zip = new JSZip();

  const addFilesToZip = (node: FileNode, path: string = '') => {
    if (node.type === 'file') {
      const filePath = path ? `${path}/${node.name}` : node.name;
      zip.file(filePath, node.content || '');
    } else if (node.type === 'folder' && node.children) {
      const folderPath = path ? `${path}/${node.name}` : node.name;
      for (const child of node.children) {
        addFilesToZip(child, node.name === project.rootFolder.name ? '' : folderPath);
      }
    }
  };

  addFilesToZip(project.rootFolder);

  const blob = await zip.generateAsync({ type: 'blob' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
